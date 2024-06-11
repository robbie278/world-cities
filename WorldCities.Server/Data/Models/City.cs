using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace WorldCities.Server.Data.Models
{

    [Table("Cities")]
    [Index(nameof(Name))]
    [Index(nameof(Lat))]
    [Index(nameof(Lon))]
    [Index(nameof(Pop))]
    public class City
    {
        
        public int Id { get; set; }
        public required string Name { get; set; } 
        public decimal Lat { get; set; }
        public decimal Lon { get; set; }
        public double Pop { get; set; }
        public int CountryId { get; set; }
        public Country? Country { get; set; }
 
   
        
    }
}
