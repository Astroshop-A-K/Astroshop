using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.Models
{
    public class ProblemsModel
    {
        [Key]
        public int ProblemId { get; set; }
        public string? NameSurname { get; set; }
        public string? Email { get; set; }
        public string? Problem { get; set; }
    }
}
