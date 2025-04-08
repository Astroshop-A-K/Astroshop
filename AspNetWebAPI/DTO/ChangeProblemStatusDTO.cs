using System.ComponentModel.DataAnnotations;

namespace AspNetCoreAPI.DTO
{
    public class ChangeProblemStatusDTO
    {
        [Required]
        public int ProblemId { get; set; }
        [Required]
        public string? ProblemStatus { get; set; }
    }
}
