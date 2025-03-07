# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('referrals', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='referral',
            name='reference_date',
            field=models.DateField(blank=True, null=True, verbose_name='תאריך אסמכתא'),
        ),
        migrations.AddIndex(
            model_name='referral',
            index=models.Index(fields=['reference_date'], name='referrals_r_referen_123456_idx'),
        ),
    ]