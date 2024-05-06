namespace AspNetCoreAPI.DTO
{
    public class ReviewsDTO
    {
        public int ReviewId { get; set; }
        public string? ReviewComment { get; set; }
        public string? ReviewCreator { get; set; }
        public double StarRating { get; set; }
        public string? ReviewedProduct { get; set; }
        public string? ReviewDate { get; set; }
    }
}
