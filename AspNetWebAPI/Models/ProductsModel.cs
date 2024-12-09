using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.Models
{
    public class ProductsModel
    {
        [Key]
        public int ProductId { get; set; }
        [Required]
        [StringLength(100, ErrorMessage = "Product name is too long")]
        public string? ProductName { get; set; }
        public string? ProductDescription { get; set; }
        [StringLength(50)]
        public string? ProductCategory { get; set; }
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Price can't be negative")]
        public float Price { get; set; }
        [Url(ErrorMessage = "Url must be valid")]
        public string? ProductImage0 { get; set; }
        [Url(ErrorMessage = "Url must be valid")]

        public string? ProductImage1 { get; set; }
        [Url(ErrorMessage = "Url must be valid")]

        public string? ProductImage2 { get; set; }
        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Quantity can't be negative")]
        public int Quantity { get; set; }
        [Range(0, 5, ErrorMessage = "Average star rating can't be more than 5 or less than 0")]
        public int AverageStarRating { get; set; }
        [Range(0, int.MaxValue, ErrorMessage = "Reviews count can't be negative")]
        public int ReviewsCount { get; set; }
        [Range(0, 100, ErrorMessage = "Product discount must be between 0 to 100 percent")]
        public int ProductDiscount { get; set; }
    }
}
