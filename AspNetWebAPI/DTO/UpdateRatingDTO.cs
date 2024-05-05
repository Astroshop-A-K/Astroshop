namespace AspNetCoreAPI.DTO
{
    public class UpdateRatingDTO
    {
        public string? ProductName { get; set; }
        public int Rating { get; set; }
        public int ReviewsCount { get; set; }
    }
}
