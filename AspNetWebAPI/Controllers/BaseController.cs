using AspNetCoreAPI.Data;
using AspNetCoreAPI.Models;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AspNetCoreAPI.Controllers
{
    [ApiController]
    public class BaseController : ControllerBase
    {
        protected readonly ApplicationDbContext Context;

        public BaseController(ApplicationDbContext context) => Context = context;


        [HttpGet]
        protected User? GetCurrentUser()
        {
            var userName = User.FindFirstValue(ClaimTypes.Name);

            return Context.Users.SingleOrDefault(user => user.UserName == userName);
        }
    }
}