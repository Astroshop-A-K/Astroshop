using AspNetCoreAPI.Data;
using AspNetCoreAPI.Models;
using Microsoft.AspNetCore.Mvc;
using AspNetCoreAPI.DTO;
using Microsoft.EntityFrameworkCore;

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

        [HttpPost("create-problem")]
        public async Task<ActionResult<ProblemsDTO>> CreateProblem([FromBody] ProblemsDTO problemsDTO)
        {
            try
            {
                var newProblem = new ProblemsModel
                {
                    NameSurname = problemsDTO.NameSurname,
                    Email = problemsDTO.Email,
                    Problem = problemsDTO.Problem,
                    ProblemDate = problemsDTO.ProblemDate,
                    ProblemStatus = "Nevyriešené"
                };

                await _context.Problems.AddAsync(newProblem);
                await _context.SaveChangesAsync();

                return Ok(new { problemId = newProblem.ProblemId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
        [HttpGet("get-problems")]
        public async Task<ActionResult<IEnumerable<ProblemsDTO>>> GetProblems()
        {
            try
            {
                var dbProblems = await _context.Problems
                    .Select(dbProblem => new ProblemsDTO
                    {
                        NameSurname = dbProblem.NameSurname,
                        Email = dbProblem.Email,
                        Problem = dbProblem.Problem,
                        ProblemDate = dbProblem.ProblemDate,
                        ProblemId = dbProblem.ProblemId,
                        ProblemStatus = dbProblem.ProblemStatus
                    }).ToListAsync();

                return Ok(dbProblems);
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
        [HttpPut("change-problem-status/{problemId}")]
        public async Task<ActionResult> ChangeProblemStatus([FromRoute] int problemId)
        {
            var problem = await _context.Problems.SingleOrDefaultAsync(p => p.ProblemId == problemId);

            if (problem == null)
            {
                return NotFound();
            }

            problem.ProblemStatus = "Vyriešený";
            await _context.SaveChangesAsync();

            return Ok(new { ProblemId = problemId, ProblemStatus = problem.ProblemStatus });
        }
    }
}
