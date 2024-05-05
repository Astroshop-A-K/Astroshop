using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.Models
{
    public class ProductsModel
    {
        [Key]
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? ProductDescription { get; set; }
        public string? ProductCategory { get; set; }
        public float Price { get; set; }
        public string? ProductImage0 { get; set; }
        public string? ProductImage1 { get; set; }
        public string? ProductImage2 { get; set; }
        public int Quantity { get; set; }
        public int AverageStarRating { get; set; }
        public int ReviewsCount { get; set; }
    }
}
