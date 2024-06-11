using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WorldCities.Server.Data.Models;

namespace WorldCities.Server.Data.Configuration
{
    public class CountryEntityTypeConfiguration
        : IEntityTypeConfiguration<Country>
    {
        public void Configure(EntityTypeBuilder<Country> builder)
        {
            builder.ToTable("Countries");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).IsRequired();
            builder.Property(x => x.Name).HasMaxLength(50);
            builder.Property(x => x.ISO2).HasMaxLength(5);
            builder.Property(x => x.ISO3).HasMaxLength(5);

        }
    }
}