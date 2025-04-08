using AspNetCoreAPI.Data;
using AspNetCoreAPI.DTO;
using AspNetCoreAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AspNetCoreAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReviewsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("create-review")]
        public async Task<ActionResult<ReviewsDTO>> CreateReview([FromBody] ReviewsDTO reviewsDTO)
        {
            try
            {
                var newReview = new ReviewsModel
                {
                    ReviewId = reviewsDTO.ReviewId,
                    ReviewComment = reviewsDTO.ReviewComment,
                    ReviewCreator = reviewsDTO.ReviewCreator,
                    ReviewedProduct = reviewsDTO.ReviewedProduct,
                    StarRating = reviewsDTO.StarRating,
                    ReviewDate = reviewsDTO.ReviewDate,
                };

                _context.Reviews.Add(newReview);
                await _context.SaveChangesAsync();

                return Ok("Successfully created review.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
        [HttpGet("get-reviews")]
        public async Task<ActionResult<IEnumerable<ReviewsDTO>>> GetReviews(string productName)
        {
            try
            {
                var reveiws = await _context.Reviews
                .Where(r => r.ReviewedProduct == productName)
                .Select(r => new ReviewsDTO
                {
                    ReviewId = r.ReviewId,
                    ReviewComment = r.ReviewComment,
                    ReviewCreator = r.ReviewCreator,
                    ReviewedProduct = r.ReviewedProduct,
                    StarRating = r.StarRating,
                    ReviewDate = r.ReviewDate
                }).ToListAsync();
                if (reveiws.Count == 0)
                {
                    return NotFound();
                }

                return Ok(reveiws);
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
        [HttpDelete("delete-review/{reviewId}")]
        public async Task<IActionResult> DeleteReview([FromRoute] int reviewId)
        {
            try
            {
                var review = await _context.Reviews.FindAsync(reviewId);
                if(review == null)
                {
                    return NotFound();
                }
                _context.Reviews.Remove(review);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
    }
}
