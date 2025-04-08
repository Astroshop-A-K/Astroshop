using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.DTO
{
    public class FavoriteProductDTO
    {
        [Required]
        public string? UserId { get; set; }
        [Required]
        public int? ProductId { get; set; }
    }
}
