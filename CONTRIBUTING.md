# 🤝 Contributing to BloodFinder

We love contributions! BloodFinder is built to save lives, and every improvement helps make emergency blood donation more effective.

## 🌟 How to Contribute

### 🐛 Bug Reports
- Use [GitHub Issues](https://github.com/The-Peacemaker/Blood-Plasma-Donation-Emergency-Finder/issues)
- Include clear description and steps to reproduce
- Add screenshots if applicable
- Mention your browser/OS version

### 💡 Feature Requests
- Create a [Discussion](https://github.com/The-Peacemaker/Blood-Plasma-Donation-Emergency-Finder/discussions) first
- Explain the use case and benefit
- Consider implementation impact

### 🔧 Code Contributions

#### Setup Development Environment
```bash
# Fork and clone the repository
git clone https://github.com/YOUR-USERNAME/Blood-Plasma-Donation-Emergency-Finder.git
cd Blood-Plasma-Donation-Emergency-Finder/BloodFinder

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your local MongoDB URI

# Start development server
npm run dev
```

#### Making Changes
1. **Create a branch**: `git checkout -b feature/your-feature-name`
2. **Make changes**: Follow the code style below
3. **Test thoroughly**: Ensure all features work
4. **Commit**: Use clear, descriptive messages
5. **Push**: `git push origin feature/your-feature-name`
6. **Pull Request**: Create PR with description

### 📝 Code Style Guidelines

#### JavaScript
- Use ES6+ features
- Prefer `const` over `let`, avoid `var`
- Use async/await over promises
- Add comments for complex logic

#### HTML/CSS
- Use semantic HTML5 elements
- Follow Tailwind CSS utility-first approach
- Ensure mobile responsiveness
- Test accessibility

#### Backend API
- Follow RESTful conventions
- Include proper error handling
- Validate all inputs
- Add appropriate HTTP status codes

### 🧪 Testing
- Test all new features manually
- Verify database operations work correctly
- Check mobile responsiveness
- Test with different blood groups and cities

### 📊 Database Changes
- Update schema documentation if needed
- Provide migration scripts for breaking changes
- Test with sample data

## 🚀 Deployment Testing
Before submitting PR:
- [ ] Code works locally
- [ ] No console errors
- [ ] Mobile responsive
- [ ] All API endpoints function correctly
- [ ] Database operations complete successfully

## 📋 Commit Message Guidelines

Use conventional commits:
```
feat: add ALL blood groups search option
fix: resolve search returning 0 results
docs: update deployment instructions
style: improve donor card responsive design
refactor: optimize database queries
```

## 🌍 Internationalization
- Consider multi-language support
- Use clear, accessible language
- Test with international phone/address formats

## 🔐 Security Guidelines
- Never commit API keys or secrets
- Validate and sanitize all inputs
- Use prepared statements for database queries
- Follow OWASP security practices

## 📖 Documentation
- Update README.md for new features
- Add inline code comments
- Update API documentation
- Include setup instructions for new dependencies

## 🏥 Emergency Features Priority
High priority contributions:
1. **Critical bug fixes**
2. **Mobile optimization**
3. **Search performance improvements**
4. **New city/region support**
5. **Accessibility improvements**

## 🤔 Questions?
- Check existing [Issues](https://github.com/The-Peacemaker/Blood-Plasma-Donation-Emergency-Finder/issues)
- Start a [Discussion](https://github.com/The-Peacemaker/Blood-Plasma-Donation-Emergency-Finder/discussions)
- Contact maintainers through GitHub

## 📜 Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Remember we're working together to save lives
- Help newcomers get started

## 🏆 Recognition
Contributors will be:
- Added to README.md contributors section
- Mentioned in release notes
- Credited in documentation

---

**Thank you for helping make BloodFinder better! Every contribution helps save lives. 💝**