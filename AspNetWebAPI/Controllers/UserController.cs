using AspNetCoreAPI.Data;
using AspNetCoreAPI.DTO;
using AspNetCoreAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AspNetCoreAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        public readonly ApplicationDbContext Context;

        public UserController(ApplicationDbContext context) => Context = context;


        [HttpGet]
        public User? GetCurrentUser()
        {
            var userName = User.FindFirstValue(ClaimTypes.Name);

            return Context.Users.SingleOrDefault(user => user.UserName == userName);
        }

        [HttpGet("role/{userId}")]
        public IActionResult GetRole(string userId)
        {
            var role = Context.UserRoles.SingleOrDefault(u => u.UserId == userId);

            if(role == null)
            {
                return NoContent();
            }

            var roleId = role.RoleId;
            var newRole = Context.Roles.SingleOrDefault(r => r.Id == roleId);

            if(newRole == null)
            {
                return NoContent();
            }

            return Ok(newRole);
        }
    }
}