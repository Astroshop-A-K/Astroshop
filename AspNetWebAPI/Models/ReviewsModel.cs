using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.Models
{
    public class ReviewsModel
    {
        [Key]
        public int ReviewId { get; set; }
        public string? ReviewComment { get; set; }
        public string? ReviewCreator { get; set; }
        public double StarRating { get; set; }
        public string? ReviewedProduct { get; set; }
    }
}
