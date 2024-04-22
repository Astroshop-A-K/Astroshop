using AspNetCoreAPI.Data;
using AspNetCoreAPI.DTO;
using AspNetCoreAPI.Models;
using Microsoft.AspNetCore.Mvc;

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

        [HttpPut("create-review")]
        public ActionResult<ReviewsDTO> CreateReview([FromBody] ReviewsDTO reviewsDTO)
        {
            try
            {
                using (var context = _context)
                {
                    var newReview = new ReviewsModel
                    {
                        ReviewId = reviewsDTO.ReviewId,
                        ReviewComment = reviewsDTO.ReviewComment,
                        ReviewCreator = reviewsDTO.ReviewCreator,
                        ReviewedProduct = reviewsDTO.ReviewedProduct,
                        StarRating = reviewsDTO.StarRating,
                    };

                    context.Reviews.Add(newReview);
                    context.SaveChanges();

                    var info = new ReviewsDTO
                    {
                        ReviewId = reviewsDTO.ReviewId,
                        ReviewComment = reviewsDTO.ReviewComment,
                        ReviewCreator = reviewsDTO.ReviewCreator,
                        ReviewedProduct = reviewsDTO.ReviewedProduct,
                        StarRating = reviewsDTO.StarRating,
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
        [HttpGet]
        [Route("getReviews")]
        public ActionResult<IEnumerable<ReviewsDTO>> GetReviews(string productName)
        {
            List<ReviewsDTO> reviews = _context.Reviews
                .Where(r => r.ReviewedProduct == productName)
                .Select(r => new ReviewsDTO
                {
                    ReviewId = r.ReviewId,
                    ReviewComment = r.ReviewComment,
                    ReviewCreator = r.ReviewCreator,
                    ReviewedProduct = r.ReviewedProduct,
                    StarRating = r.StarRating
                })
                .ToList();

            return reviews;
        }
    }
}
