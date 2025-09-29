# 💼 Kartik Gupta – Portfolio Website

This repository contains the source code for my personal portfolio website, hosted on AWS with automated deployment via GitHub Actions. The site showcases my professional background, technical skills, and selected projects.

---

## 🌐 Live Website

[https://kartikgupta.in](https://kartikgupta.in)

---

## 🚀 Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Lucide Icons
- **Hosting**: AWS S3 (static website hosting)
- **CDN & HTTPS**: AWS CloudFront with SSL via ACM
- **Domain Management**: AWS Route 53
- **CI/CD**: GitHub Actions (S3 sync + CloudFront cache invalidation)

---

## 📁 Folder Structure

```
├── index.html
├── about/
│   └── index.html
├── projects/
│   └── index.html
├── contact/
│   └── index.html
├── 404.html
├── assets/
│   └── images/
├── .github/
│   └── workflows/
```

---

## 🔄 Deployment Workflow (CI/CD)

Every push to the `main` branch triggers:

1. Automatic file sync to the S3 bucket hosting `kartikgupta.in`
2. CloudFront cache invalidation (`/*`) to immediately reflect changes

### 🔐 GitHub Secrets Used

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DISTRIBUTION_ID` (CloudFront Distribution ID)

---

## ✨ Features

- ✅ Fully responsive and mobile-friendly design
- 🌗 Dark and light mode toggle with icon switch
- 🔗 Clean URLs without `.html` extensions (using folder-based routing)
- ⚠️ Custom 404 error page for better user experience
- 📈 Performance optimized with CloudFront CDN
- 🛡️ HTTPS enforced with AWS ACM

---

## 🛠️ Getting Started (Personal Setup)

To reuse this setup:

1. Clone or fork this repository
2. Create an S3 bucket for static website hosting
3. Set up a CloudFront distribution with a valid SSL certificate (ACM)
4. Point your domain via Route 53 to CloudFront
5. Configure the following GitHub repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `DISTRIBUTION_ID`
6. Push to the `main` branch — GitHub Actions will handle deployment and cache invalidation automatically.

---

## 📬 Contact

If you'd like to connect, collaborate, or provide feedback, feel free to [reach out](https://kartikgupta.in/contact).

---

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).
