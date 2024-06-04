using Microsoft.AspNetCore.Mvc;
using AspNetCoreAPI.Data;
using AspNetCoreAPI.Models;
using AspNetCoreAPI.DTO;

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

        [HttpGet]
        public IEnumerable<ProductsDTO> GetProductInformation()
        {
            IEnumerable<ProductsModel> dbProducts = _context.Products;

            return dbProducts.Select(dbProducts => new ProductsDTO
            {
                ProductId = dbProducts.ProductId,
                ProductName = dbProducts.ProductName,
                ProductDescription = dbProducts.ProductDescription,
                Price = dbProducts.Price,
                ProductCategory = dbProducts.ProductCategory,
                ProductImage0 = dbProducts.ProductImage0,
                ProductImage1 = dbProducts.ProductImage1,
                ProductImage2 = dbProducts.ProductImage2,
                Quantity = dbProducts.Quantity,
                AverageStarRating = dbProducts.AverageStarRating,
                ReviewsCount = dbProducts.ReviewsCount,
            });
        }
        [HttpGet]
        [Route("getProductInfo")]
        public ProductsDTO getProductInfo(string productName)
        {
            ProductsModel product = _context.Products.Where(p => p.ProductName == productName).FirstOrDefault();

            var info = new ProductsDTO
            {
                ProductId = product.ProductId,
                ProductName = productName,
                ProductDescription = product.ProductDescription,
                Price = product.Price,
                ProductCategory = product.ProductCategory,
                ProductImage0 = product.ProductImage0,
                ProductImage1 = product.ProductImage1,
                ProductImage2 = product.ProductImage2,
                Quantity = product.Quantity,
                AverageStarRating = product.AverageStarRating,
                ReviewsCount = product.ReviewsCount
            };

            return info;
        }
        [HttpPut("update-rating")]
        public ActionResult<UpdateRatingDTO> UpdateAverageStarRating([FromBody] UpdateRatingDTO updateRatingDTO)
        {
            try
            {
                var product = _context.Products.SingleOrDefault(p => p.ProductName == updateRatingDTO.ProductName);

                if(product == null)
                {
                    return NotFound(updateRatingDTO.ProductName);
                }

                product.AverageStarRating = updateRatingDTO.Rating;
                product.ReviewsCount = updateRatingDTO.ReviewsCount;
                _context.SaveChanges();

                return Ok(updateRatingDTO);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut("add-favorite-product")]
        public ActionResult<FavoriteProductDTO> AddProductId([FromBody] FavoriteProductDTO favoriteProductDTO)
        {
            try
            {
                var newRow = new FavoriteProductModel
                {
                    ProductId = favoriteProductDTO.ProductId,
                    UserId = favoriteProductDTO.UserId
                };

                _context.FavoriteProducts.Add(newRow);
                _context.SaveChanges();

                return Ok("Success!");
            }
            catch 
            {
                return Ok("User already has this product in favorites!"); ;
            }
        }
        [HttpGet]
        [Route("getFavoriteProducts")]
        public ActionResult<List<ProductsDTO>> getFavoriteProducts([FromQuery] string userId)
        {
            try
            {
                List<FavoriteProductDTO> products = _context.FavoriteProducts
                .Where(p => p.UserId == userId)
                .Select(p => new FavoriteProductDTO
                {
                    ProductId = p.ProductId,
                })
                .ToList();


                if (products.Count == 0)
                {
                    return null;
                }

                List<ProductsDTO> productsInfos = new List<ProductsDTO>();

                foreach (var favoriteProduct in products)
                {
                    ProductsModel product = _context.Products.FirstOrDefault(p => p.ProductId == favoriteProduct.ProductId);

                    if (product != null)
                    {
                        ProductsDTO info = new ProductsDTO
                        {
                            ProductName = product.ProductName,
                            ProductImage0 = product.ProductImage0,
                        };

                        productsInfos.Add(info);
                    }
                }
                return Ok(productsInfos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }
        /*[HttpDelete("remove-favorite-product")]
        public IActionResult RemoveFavoriteProduct([FromQuery] string userId, int productId)
        {
            try
            {
                var product = _context.FavoriteProducts.FirstOrDefault(p => p.ProductId == productId && p.UserId == userId);

                    if (product == null)
                    {
                        return NotFound();
                    }

                    _context.FavoriteProducts.Remove(product);
                    _context.SaveChanges();

                    return Ok("removed" + product);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
                return StatusCode(500);
            }
        }*/
    }
}
