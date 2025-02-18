using AspNetCoreAPI.Data;
using AspNetCoreAPI.Models;
using AspNetCoreAPI.Registration.dto;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace AspNetCoreAPI.Registration
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly JwtHandler _jwtHandler;
        private readonly ApplicationDbContext _context;

        public UserController(UserManager<User> userManager, JwtHandler jwtHandler, ApplicationDbContext context)
        {
            _userManager = userManager;
            _jwtHandler = jwtHandler;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] UserRegistrationDto userRegistrationDto)
        {
            if (userRegistrationDto == null || !ModelState.IsValid)
            {
                return BadRequest("Invalid registration data.");
            }

            var existingUser = await _userManager.FindByEmailAsync(userRegistrationDto.Email);

            if (existingUser != null)
            {
                return BadRequest("This user already exists");
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

            return Ok(new { message = "Registration initiated. Check your email for the verification link.", encodedToken });
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
                return BadRequest("Invalid token");
            }

            if (pendingUser.ExpiresAt < DateTime.UtcNow)
            {
                return BadRequest("Token expired.");
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
                return BadRequest(new { message = "Creation of user failed.", errors = result.Errors.Select(e => e.Description) });
            }

            _context.PendingUsers.Remove(pendingUser);
            await _context.SaveChangesAsync();

            var signingCredentials = _jwtHandler.GetSigningCredentials();
            var claims = _jwtHandler.GetClaims(newUser);
            var tokenOptions = _jwtHandler.GenerateTokenOptions(signingCredentials, claims);
            var jwtToken = new JwtSecurityTokenHandler().WriteToken(tokenOptions);


            return Ok(new UserLoginResponseDto { IsAuthSuccessful = true, Token = token, Username = newUser.UserName });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto userLoginDto)
        {
            var user = await _userManager.FindByNameAsync(userLoginDto.Email);

            if (user == null || !await _userManager.CheckPasswordAsync(user, userLoginDto.Password))
                return Unauthorized(new UserLoginResponseDto { ErrorMessage = "Invalid Authentication" });

            var signingCredentials = _jwtHandler.GetSigningCredentials();
            var claims = _jwtHandler.GetClaims(user);
            var tokenOptions = _jwtHandler.GenerateTokenOptions(signingCredentials, claims);
            var token = new JwtSecurityTokenHandler().WriteToken(tokenOptions);

            return Ok(new UserLoginResponseDto { IsAuthSuccessful = true, Token = token, Username = user.UserName });
        }

        [HttpGet]
        public User? GetCurrentUser()
        {
            var userName = User.FindFirstValue(ClaimTypes.Name);

            return _context.Users.SingleOrDefault(user => user.UserName == userName);
        }

        [HttpGet("role/{userId}")]
        public IActionResult GetRole(string userId)
        {
            var role = _context.UserRoles.SingleOrDefault(u => u.UserId == userId);

            if (role == null)
            {
                return NoContent();
            }

            var roleId = role.RoleId;
            var newRole = _context.Roles.SingleOrDefault(r => r.Id == roleId);

            if (newRole == null)
            {
                return NoContent();
            }

            return Ok(newRole);
        }
    }
}
