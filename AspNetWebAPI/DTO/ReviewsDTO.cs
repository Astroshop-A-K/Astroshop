using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.DTO
{
    public class ReviewsDTO
    {
        public int ReviewId { get; set; }
        [Required]
        public string? ReviewComment { get; set; }
        [Required]
        public string? ReviewCreator { get; set; }
        [Required]
        public double StarRating { get; set; }
        [Required]
        public string? ReviewedProduct { get; set; }
        [Required]
        public string? ReviewDate { get; set; }
    }
}
