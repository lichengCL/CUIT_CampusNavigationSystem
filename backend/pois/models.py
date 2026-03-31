from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default="#4285F4")

    class Meta:
        db_table = "category"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class POI(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="pois",
    )
    lng = models.DecimalField(max_digits=9, decimal_places=6)
    lat = models.DecimalField(max_digits=8, decimal_places=6)
    description = models.TextField(default="", blank=True)

    class Meta:
        db_table = "poi"
        ordering = ["id"]

    def __str__(self) -> str:
        return self.name
