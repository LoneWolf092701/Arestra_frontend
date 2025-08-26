import React from 'react';
import { Box, Typography, Container, Link, Divider } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import logo from '../../assets/images/Logo.png';
import { useTheme } from '../../contexts/ThemeContext';

const Footer = () => {
  const { theme, isDark } = useTheme();

  /**
   * Social Media Links Data
   */
  const socialLinks = [
    { icon: <FacebookIcon />, url: 'https://facebook.com', label: 'Facebook' },
    { icon: <TwitterIcon />, url: 'https://twitter.com', label: 'Twitter' },
    { icon: <InstagramIcon />, url: 'https://instagram.com', label: 'Instagram' },
    { icon: <LinkedInIcon />, url: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  /**
   * Footer Links Data
   * Organized by sections for easy navigation and maintenance
   */
  const footerSections = [
    {
      title: 'For Tenants',
      links: [
        { text: 'Find Properties', url: '/user-allproperties' },
        { text: 'How It Works', url: '/how-it-works' },
        { text: 'Safety Tips', url: '/safety' },
        { text: 'FAQs', url: '/faq' },
      ]
    },
    {
      title: 'For Property Owners',
      links: [
        { text: 'List Your Property', url: '/addproperty' },
        { text: 'Pricing Guide', url: '/pricing' },
        { text: 'Success Stories', url: '/success' },
        { text: 'Support', url: '/support' },
      ]
    },
    {
      title: 'Company',
      links: [
        { text: 'About Us', url: '/about' },
        { text: 'Careers', url: '/careers' },
        { text: 'Contact', url: '/contact' },
        { text: 'Blog', url: '/blog' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { text: 'Terms of Service', url: '/terms' },
        { text: 'Privacy Policy', url: '/privacy' },
        { text: 'Cookie Policy', url: '/cookies' },
        { text: 'Disclaimer', url: '/disclaimer' },
      ]
    }
  ];

  return (
    <Box
      component="footer"
      sx={{
        // Creating a sophisticated gradient background that adapts to the theme
        background: isDark 
          ? `linear-gradient(135deg, ${theme.primary} 0%, ${theme.cardBackground} 100%)`
          : `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary}20 100%)`,
        color: isDark ? theme.textPrimary : '#FFFFFF',
        mt: 'auto', // Pushes footer to bottom when content is short
        // Professional drop shadow that works in both light and dark themes
        boxShadow: `0 -4px 20px ${isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}`,
        // Smooth transitions make theme changes feel polished
        transition: 'all 0.3s ease',
      }}
    >
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Box sx={{ py: 0 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr', // Single column on mobile
                sm: '1fr 1fr', // Two columns on small screens
                md: '2fr 1fr 1fr 1fr 1fr', // Five columns on larger screens (logo takes 2 units)
              },
              gap: 4,
              alignItems: 'flex-start',
            }}
          >
            {/* Company Brand Section */}
            <Box>
              <Box
                component="img"
                src={logo}
                alt="StayWise.lk Logo"
                sx={{
                  width: '200px',
                  height: '54px',
                  objectFit: 'contain',
                  mb: 3,
                  // Logo brightness adjustment for better visibility on different backgrounds
                  filter: isDark ? 'brightness(1.2)' : 'brightness(1)',
                  transition: 'filter 0.3s ease',
                }}
              />
              {/* <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3, 
                  lineHeight: 1.6,
                  color: isDark ? theme.textSecondary : 'rgba(255,255,255,0.9)',
                }}
              >
                StayWise.lk is Sri Lanka's premier platform for finding and listing 
                rental properties. We connect property owners with tenants through 
                a secure, user-friendly experience.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {socialLinks.map((social, index) => (
                  <Link
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    sx={{
                      color: isDark ? theme.textPrimary : 'rgba(255,255,255,0.8)',
                      '&:hover': {
                        color: theme.accent,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {social.icon}
                  </Link>
                ))}
              </Box> */}
            </Box>

            {/* Footer Navigation Sections */}
            {/* {footerSections.map((section, sectionIndex) => (
              <Box key={sectionIndex}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    fontWeight: 600,
                    color: isDark ? theme.textPrimary : '#FFFFFF',
                  }}
                >
                  {section.title}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {section.links.map((link, linkIndex) => (
                    <Link
                      key={linkIndex}
                      href={link.url}
                      sx={{
                        color: isDark ? theme.textSecondary : 'rgba(255,255,255,0.8)',
                        textDecoration: 'none',
                        '&:hover': {
                          color: theme.accent,
                          textDecoration: 'underline',
                        },
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {link.text}
                    </Link>
                  ))}
                </Box>
              </Box>
            ))} */}
          </Box>
        </Box>

        {/* Footer Bottom Section */}
        <Divider 
          sx={{ 
            borderColor: isDark ? theme.border : 'rgba(255,255,255,0.2)',
            transition: 'border-color 0.3s ease',
          }} 
        />
        
        <Box
          sx={{
            py: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: isDark ? theme.textSecondary : 'rgba(255,255,255,0.7)',
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            &copy; {new Date().getFullYear()} StayWise.lk. All rights reserved. 
            Powered by innovative property technology.
          </Typography>

          <Box 
            sx={{ 
              display: 'flex', 
              gap: 3,
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'flex-end' },
            }}
          >
            {['Accessibility', 'Sitemap', 'Help-support'].map((text, index) => (
              <Link
                key={index}
                href={`/${text.toLowerCase()}`}
                sx={{
                  color: isDark ? theme.textSecondary : 'rgba(255,255,255,0.7)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: theme.accent,
                    textDecoration: 'underline',
                  },
                  transition: 'color 0.2s ease',
                }}
              >
                {text}
              </Link>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;