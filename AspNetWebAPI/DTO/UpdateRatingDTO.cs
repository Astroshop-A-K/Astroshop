using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.DTO
{
    public class UpdateRatingDTO
    {
        [Required]
        public string? ProductName { get; set; }
        [Required]
        public int Rating { get; set; }
        [Required]
        public int ReviewsCount { get; set; }
    }
}
