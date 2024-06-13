using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.Models
{
    [PrimaryKey(nameof(UserId), nameof(ProductId))]
    public class FavoriteProductModel
    {
        public string? UserId { get; set; }
        public int? ProductId { get; set; }
    }
}
