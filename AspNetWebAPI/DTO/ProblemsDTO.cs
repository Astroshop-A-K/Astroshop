using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.DTO
{
    public class ProblemsDTO
    {
        public int ProblemId { get; set; }
        [Required]
        public string? NameSurname { get; set; }
        [Required]
        public string? Email { get; set; }
        [Required]
        public string? Problem { get; set; }
        [Required]
        public string? ProblemDate { get; set; }
        public string? ProblemStatus { get; set; }
    }
}
