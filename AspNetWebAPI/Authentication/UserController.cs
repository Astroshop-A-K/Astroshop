using AspNetCoreAPI.Data;
using AspNetCoreAPI.Models;
using AspNetCoreAPI.Registration.dto;
using AspNetCoreAPI.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AspNetCoreAPI.Registration
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly JwtHandler _jwtHandler;
        private readonly ApplicationDbContext _context;
        private readonly RecaptchaService _recaptchaService;

        public UserController(UserManager<User> userManager, JwtHandler jwtHandler, ApplicationDbContext context, RecaptchaService recaptchaService)
        {
            _userManager = userManager;
            _jwtHandler = jwtHandler;
            _context = context;
            _recaptchaService = recaptchaService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] UserRegistrationDto userRegistrationDto)
        {
            if (userRegistrationDto == null || !ModelState.IsValid)
            {
                return BadRequest(new { message = "Invalid registration data"} );
            }

            var isRecaptchaValid = await _recaptchaService.VerifyCaptcha(userRegistrationDto.RecaptchaResponse);

            if (!isRecaptchaValid)
            {
                return BadRequest(new { message = "An error occurred while trying to verify recaptcha." });
            }

            var existingUser = await _userManager.FindByEmailAsync(userRegistrationDto.Email);

            if (existingUser != null)
            {
                return BadRequest(new { ErrorMessage = "This user already exists" });
            }

            var tempUser = new User { Email = userRegistrationDto.Email, UserName = userRegistrationDto.Email };
            string hashedPassword = _userManager.PasswordHasher.HashPassword(tempUser, userRegistrationDto.Password);

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(tempUser);
            var encodedToken = Convert.ToBase64String(Encoding.UTF8.GetBytes(token)).Replace("+", "-").Replace("/", "_").Replace("=", "");

            var pendingUser = new PendingUsersModel
            {
                Email = userRegistrationDto.Email,
                PasswordHash = hashedPassword,
                Token = encodedToken,
                ExpiresAt = DateTime.UtcNow.AddHours(1) 
            };

            _context.PendingUsers.Add(pendingUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration started sending token to e-mail!", encodedToken });
        }
        [HttpGet("verify")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return BadRequest("Token is required!");
            }

            var pendingUser = await _context.PendingUsers.FirstOrDefaultAsync(p => p.Token == token);

            if (pendingUser == null)
            {
                return BadRequest(new { status = "invalid", message = "Invalid token!" });
            }

            if (pendingUser.ExpiresAt < DateTime.UtcNow)
            {
                return BadRequest(new { status = "expired", message = "Token is expired!" });
            }

            var newUser = new User
            {
                Email = pendingUser.Email,
                UserName = pendingUser.Email,
                EmailConfirmed = true,
                PasswordHash = pendingUser.PasswordHash
            };

            var result = await _userManager.CreateAsync(newUser);

            if (!result.Succeeded)
            {
                return BadRequest(new { message = "An error occurred while trying to create user."});
            }

            _context.PendingUsers.Remove(pendingUser);
            await _context.SaveChangesAsync();

            var signingCredentials = _jwtHandler.GetSigningCredentials();
            var claims = _jwtHandler.GetClaims(newUser);
            var tokenOptions = _jwtHandler.GenerateTokenOptions(signingCredentials, claims);
            var jwtToken = new JwtSecurityTokenHandler().WriteToken(tokenOptions);


            return Ok(new UserLoginResponseDto { IsAuthSuccessful = true, Token = jwtToken, Username = newUser.UserName });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto userLoginDto)
        {
            var user = await _userManager.FindByNameAsync(userLoginDto.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, userLoginDto.Password))
            {
                return Unauthorized(new UserLoginResponseDto { ErrorMessage = "Invalid Authentication", IsAuthSuccessful = false });
            }

            var signingCredentials = _jwtHandler.GetSigningCredentials();
            var claims = _jwtHandler.GetClaims(user);
            var tokenOptions = _jwtHandler.GenerateTokenOptions(signingCredentials, claims);
            var token = new JwtSecurityTokenHandler().WriteToken(tokenOptions);

            return Ok(new UserLoginResponseDto { IsAuthSuccessful = true, Token = token, Username = user.UserName, UserId = user.Id });
        }

        [HttpGet("get-user")]
        public User? GetCurrentUser()
        {
            var userName = User.FindFirstValue(ClaimTypes.Name);

            return _context.Users.SingleOrDefault(user => user.UserName == userName);
        }

        [HttpGet("role/{userId}")]
        public async Task<IActionResult> GetRole([FromRoute] string userId)
        {
            var role = await _context.UserRoles.SingleOrDefaultAsync(u => u.UserId == userId);

            if (role == null)
            {
                return NotFound();
            }

            var newRole = await _context.Roles.SingleOrDefaultAsync(r => r.Id == role.RoleId);

            if (newRole == null)
            {
                return NotFound();
            }

            return Ok(newRole);
        }
    }
}
