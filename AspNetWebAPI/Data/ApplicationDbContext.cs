using AspNetCoreAPI.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AspNetCoreAPI.Data
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {

        }
        public DbSet<ProductsModel> Products { get; set; }
        public DbSet<ProblemsModel> Problems { get; set; }
        public DbSet<OrdersModel> Orders { get; set; }
        public DbSet<ReviewsModel> Reviews { get; set; }
        public DbSet<OrderProductsModel> OrderProducts { get; set; }
        public DbSet<FavoriteProductModel> FavoriteProducts { get; set; }
        public DbSet<PendingUsersModel> PendingUsers { get; set; }
    }
}
