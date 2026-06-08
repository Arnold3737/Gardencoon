from PIL import Image, ImageDraw, ImageFont
import os

pages = [
  ('og-index.jpg', 'assets/hero-home-1920.jpg', 'Garden State Coon — Maine Coon Cattery'),
  ('og-about.jpg', 'assets/hero-about-1920.jpg', 'About Garden State Coon'),
  ('og-kittens.jpg', 'assets/hero-kittens-1920.jpg', 'Available Kittens'),
  ('og-gallery.jpg', 'assets/hero-gallery-1920.jpg', 'Photo Gallery'),
  ('og-our-cats.jpg', 'assets/hero-our-cats-1920.jpg', 'Our Cats'),
  ('og-contact.jpg', 'assets/hero-contact-1920.jpg', 'Contact Us'),
  ('og-faq.jpg', 'assets/hero-faq-1920.jpg', 'FAQ'),
  ('og-health-testing.jpg', 'assets/hero-health-1920.jpg', 'Health Testing'),
  ('og-shipping.jpg', 'assets/hero-shipping-1920.jpg', 'Shipping & Delivery'),
  ('og-waiting-list.jpg', 'assets/hero-waiting-1920.jpg', 'Waiting List'),
  ('og-kitten-detail.jpg', 'assets/kitten-1-1920.jpg', 'Kitten Details'),
  ('og-purchase-contract.jpg', 'assets/hero-home-1920.jpg', 'Purchase Contract'),
  ('og-privacy-policy.jpg', 'assets/hero-home-1920.jpg', 'Privacy Policy'),
  ('og-terms-of-sale.jpg', 'assets/hero-home-1920.jpg', 'Terms of Sale'),
  ('og-cookie-policy.jpg', 'assets/hero-home-1920.jpg', 'Cookie Policy'),
  ('og-404.jpg', 'assets/hero-home-1920.jpg', 'Page Not Found'),
]

for out, src, text in pages:
  img = Image.open(src).convert('RGB').resize((1200,630))
  overlay = Image.new('RGBA',(1200,630),(0,0,0,120))
  img.paste(overlay, mask=overlay)
  d = ImageDraw.Draw(img)
  d.text((60,260), text, fill=(255,255,255), font_size=48)
  d.text((60,340), 'gardenstatecoon.com', fill=(201,169,110), font_size=28)
  img.save(f'assets/{out}', quality=85)
  print(f'  ✓ {out}')
