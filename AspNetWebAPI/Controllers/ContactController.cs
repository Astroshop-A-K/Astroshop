using AspNetCoreAPI.Data;
using AspNetCoreAPI.Models;
using Microsoft.AspNetCore.Mvc;
using AspNetCoreAPI.DTO;

namespace AspNetCoreAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ContactController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ContactController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPut("create")]
        public ActionResult<ProblemsDTO> CreateProblem([FromBody] ProblemsDTO problemsDTO)
        {
            try
            {
                using (var context = _context)
                {
                    var newProblem = new ProblemsModel
                    {
                        NameSurname = problemsDTO.NameSurname,
                        Email = problemsDTO.Email,
                        Problem = problemsDTO.Problem
                    };

                    context.Problems.Add(newProblem);
                    context.SaveChanges();

                    var info = new ProblemsDTO
                    {
                        NameSurname = problemsDTO.NameSurname,
                        Email = problemsDTO.Email,
                        Problem = problemsDTO.Problem
                    };

                    return Ok(info);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error");
                return StatusCode(500, new { message = "Mame problem." });
            }
        }
    }
}
