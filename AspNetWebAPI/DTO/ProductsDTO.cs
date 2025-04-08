using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.DTO
{
    public class ProductsDTO
    {
        public int ProductId { get; set; }
        [Required]
        public string? ProductName { get; set; }
        [Required]
        public string? ProductDescription { get; set; }
        [Required]
        public string? ProductCategory { get; set; }
        [Required]
        public float Price { get; set; }
        [Required]
        public string? ProductImage0 { get; set; }
        [Required]
        public string? ProductImage1 { get; set; }
        [Required]
        public string? ProductImage2 { get; set; }
        [Required]
        public int Quantity { get; set; }
        [Required]
        public int AverageStarRating { get; set; }
        [Required]
        public int ReviewsCount { get; set; }
        public int ProductDiscount { get; set; }
    }
}
