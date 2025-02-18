using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.Models
{
    public class ProductsModel
    {
        [Key]
        public int ProductId { get; set; }
        [Required] // na urovni aplikacie sa kontroluju a kedze produkty zatial administrator nema moznost pridavat tak toto tu potrebne nie je
        public string? ProductName { get; set; }
        [Required]
        public string? ProductDescription { get; set; }
        [Required]
        public string? ProductCategory { get; set; }
        [Required]
        public float Price { get; set; }
        [Url(ErrorMessage = "Url must be valid")]
        public string? ProductImage0 { get; set; }
        [Url(ErrorMessage = "Url must be valid")]
        public string? ProductImage1 { get; set; }
        [Url(ErrorMessage = "Url must be valid")]
        public string? ProductImage2 { get; set; }
        [Required]
        public int Quantity { get; set; }
        public int AverageStarRating { get; set; }
        public int ReviewsCount { get; set; }
        public int ProductDiscount { get; set; } 
    }
}
