using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.Models
{
    public class FavoriteProductModel
    {
        [Key]
        public string? UserId { get; set; }
        public int? ProductId { get; set; }
    }
}
