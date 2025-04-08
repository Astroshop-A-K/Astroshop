using Microsoft.AspNetCore.Mvc;
using AspNetCoreAPI.Data;
using AspNetCoreAPI.Models;
using AspNetCoreAPI.DTO;
using Microsoft.EntityFrameworkCore;

namespace AspNetCoreAPI.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("get-products")]
        public async Task<ActionResult<IEnumerable<ProductsDTO>>> GetProductInformation()
        {
            try
            {
                var dbProducts = await _context.Products
                    .Select(dbProduct => new ProductsDTO
                    {
                        ProductId = dbProduct.ProductId,
                        ProductName = dbProduct.ProductName,
                        ProductDescription = dbProduct.ProductDescription,
                        Price = dbProduct.Price,
                        ProductCategory = dbProduct.ProductCategory,
                        ProductImage0 = dbProduct.ProductImage0,
                        ProductImage1 = dbProduct.ProductImage1,
                        ProductImage2 = dbProduct.ProductImage2,
                        Quantity = dbProduct.Quantity,
                        AverageStarRating = dbProduct.AverageStarRating,
                        ReviewsCount = dbProduct.ReviewsCount,
                        ProductDiscount = dbProduct.ProductDiscount
                    }).ToListAsync();
                return Ok(dbProducts);
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
        [HttpGet("get-product-information")]
        public async Task<ActionResult<ProductsDTO>> GetProductInfo([FromQuery] string productName)
        {
            try
            {
                var product = await _context.Products
                    .Where(p => p.ProductName == productName)
                    .FirstOrDefaultAsync();

                if(product == null)
                {
                    return NotFound();
                }

                var info = new ProductsDTO
                {
                    ProductId = product.ProductId,
                    ProductName = product.ProductName,
                    ProductDescription = product.ProductDescription,
                    Price = product.Price,
                    ProductCategory = product.ProductCategory,
                    ProductImage0 = product.ProductImage0,
                    ProductImage1 = product.ProductImage1,
                    ProductImage2 = product.ProductImage2,
                    Quantity = product.Quantity,
                    AverageStarRating = product.AverageStarRating,
                    ReviewsCount = product.ReviewsCount,
                    ProductDiscount = product.ProductDiscount
                };

                return Ok(info);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
        [HttpPut("update-rating")]
        public async Task<ActionResult<UpdateRatingDTO>> UpdateAverageStarRating([FromBody] UpdateRatingDTO updateRatingDTO)
        {
            try
            {
                if (updateRatingDTO.Rating < 1 || updateRatingDTO.Rating > 5)
                {
                    return BadRequest("Rating must be in the range 1-5");
                }

                var product = await _context.Products
                    .Where(p => p.ProductName == updateRatingDTO.ProductName)
                    .FirstOrDefaultAsync();

                if(product == null)
                {
                    return NotFound();
                }

                product.AverageStarRating = updateRatingDTO.Rating;
                product.ReviewsCount = updateRatingDTO.ReviewsCount;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Success!"});
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
        [HttpPost("add-favorite-product")]
        public async Task<ActionResult> AddProductId([FromBody] FavoriteProductDTO favoriteProductDTO)
        {
            try
            {
                var newRow = new FavoriteProductModel
                {
                    ProductId = favoriteProductDTO.ProductId,
                    UserId = favoriteProductDTO.UserId
                };

                await _context.FavoriteProducts.AddAsync(newRow);
                await _context.SaveChangesAsync();

                return Ok("Success!");
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
        [HttpGet("get-favorite-products")]
        public async Task<ActionResult<List<ProductsDTO>>> GetFavoriteProducts([FromQuery] string userId)
        {
            try
            {
                var favoriteProducts = await _context.FavoriteProducts
                    .Where(p => p.UserId == userId)
                    .Select(p => p.ProductId)
                    .ToListAsync();

                if(favoriteProducts.Count == 0)
                {
                    return null;
                };

                var productsInfos = await _context.Products
                    .Where(p => favoriteProducts.Contains(p.ProductId))
                    .Select(p => new ProductsDTO
                    {
                        ProductId = p.ProductId,
                        ProductName = p.ProductName,
                        ProductCategory = p.ProductCategory,
                        ProductImage0 = p.ProductImage0,
                        ProductDiscount = p.ProductDiscount
                    }).ToListAsync();

                return Ok(productsInfos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
        [HttpDelete("remove-favorite-product")]
        public async Task<IActionResult> RemoveFavoriteProduct([FromQuery] string userId, int productId)
        {
            try
            {
                var favoriteProduct = await _context.FavoriteProducts.FirstOrDefaultAsync(p => p.UserId == userId && p.ProductId == productId);
                if(favoriteProduct == null)
                {
                    return NotFound();
                };
                _context.FavoriteProducts.Remove(favoriteProduct);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Successfully removed favorite product." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }
    }
}
