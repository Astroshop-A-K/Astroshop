using AspNetCoreAPI.Data;
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
    }
}