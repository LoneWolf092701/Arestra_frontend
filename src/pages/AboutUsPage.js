import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  LinearProgress
} from '@mui/material';
import {
  Home as HomeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Verified as VerifiedIcon,
  Groups as GroupsIcon,
  LocalAtm as LocalAtmIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  BusinessCenter as BusinessCenterIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  DesignServices as DesignIcon,
  Support as SupportIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Language as LanguageIcon,
  Shield as ShieldIcon,
  Payment as PaymentIcon,
  Notifications as NotificationsIcon,
  CloudUpload as CloudUploadIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const AboutUsPage = () => {
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();

  const stats = [
    { label: 'Properties Listed', value: '10,000+', icon: <HomeIcon /> },
    { label: 'Happy Tenants', value: '25,000+', icon: <GroupsIcon /> },
    { label: 'Property Owners', value: '5,000+', icon: <BusinessCenterIcon /> },
    { label: 'Cities Covered', value: '50+', icon: <LocationOnIcon /> }
  ];

  const services = [
    {
      icon: <HomeIcon />,
      title: 'Property Listings',
      description: 'List your rooms, hostels, and rental units with detailed descriptions, photos, and amenities.'
    },
    {
      icon: <VerifiedIcon />,
      title: 'Verified Properties',
      description: 'All properties go through our rigorous verification process to ensure quality and authenticity.'
    },
    {
      icon: <PaymentIcon />,
      title: 'Secure Payments',
      description: 'Multiple payment options including Stripe integration and receipt upload with NIC verification.'
    },
    {
      icon: <NotificationsIcon />,
      title: 'Real-time Notifications',
      description: 'Stay updated with instant notifications via WhatsApp and in-app alerts.'
    },
    {
      icon: <ShieldIcon />,
      title: 'Safe & Secure',
      description: 'Advanced security measures and user verification ensure a safe rental experience.'
    },
    {
      icon: <SupportIcon />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to assist with any queries or concerns.'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Browse Properties',
      description: 'Search and filter through thousands of verified properties',
      icon: <HomeIcon />
    },
    {
      step: '2',
      title: 'Submit Booking',
      description: 'Send booking request with your details and preferences',
      icon: <CheckCircleIcon />
    },
    {
      step: '3',
      title: 'Owner Approval',
      description: 'Property owner reviews and responds with payment details',
      icon: <VerifiedIcon />
    },
    {
      step: '4',
      title: 'Secure Payment',
      description: 'Pay securely via Stripe or upload payment proof with NIC',
      icon: <PaymentIcon />
    },
    {
      step: '5',
      title: 'Move In',
      description: 'Confirmation received! Ready to move into your new space',
      icon: <AutoAwesomeIcon />
    }
  ];

  // const team = [
  //   {
  //     name: 'Sarah Johnson',
  //     role: 'CEO & Founder',
  //     image: '/images/team/ceo.jpg',
  //     bio: 'Former real estate executive with 15+ years of experience in property management.',
  //     icon: <BusinessCenterIcon />
  //   },
  //   {
  //     name: 'Michael Chen',
  //     role: 'CTO',
  //     image: '/images/team/cto.jpg',
  //     bio: 'Tech leader with expertise in scalable platform development and cloud architecture.',
  //     icon: <CodeIcon />
  //   },
  //   {
  //     name: 'Emily Rodriguez',
  //     role: 'Head of Design',
  //     image: '/images/team/design.jpg',
  //     bio: 'UX/UI specialist focused on creating intuitive and accessible user experiences.',
  //     icon: <DesignIcon />
  //   },
  //   {
  //     name: 'David Kumar',
  //     role: 'Head of Customer Success',
  //     image: '/images/team/support.jpg',
  //     bio: 'Customer service expert ensuring exceptional support and satisfaction.',
  //     icon: <SupportIcon />
  //   }
  // ];

  const values = [
    {
      title: 'Trust & Transparency',
      description: 'Building trust through transparent processes and honest communication',
      icon: <VerifiedIcon />,
      color: 'primary'
    },
    {
      title: 'Innovation',
      description: 'Continuously improving our platform with cutting-edge technology',
      icon: <AutoAwesomeIcon />,
      color: 'secondary'
    },
    {
      title: 'Customer First',
      description: 'Putting our users\' needs and satisfaction at the center of everything we do',
      icon: <GroupsIcon />,
      color: 'success'
    },
    {
      title: 'Quality Assurance',
      description: 'Maintaining high standards for properties and user experiences',
      icon: <StarIcon />,
      color: 'warning'
    }
  ];

  // const achievements = [
  //   { year: '2020', milestone: 'StayWise Founded', progress: 25 },
  //   { year: '2021', milestone: 'First 1,000 Properties', progress: 50 },
  //   { year: '2023', milestone: 'Mobile App Launch', progress: 75 },
  //   { year: '2024', milestone: 'AI-Powered Matching', progress: 100 }
  // ];

  return (
    <Box sx={{ backgroundColor: isDark ? theme.background : '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ 
        background: isDark 
          ? 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)'
          : 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
        color: 'white',
        py: 8,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                About StayWise
              </Typography>
              <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                Revolutionizing Property Rentals in Sri Lanka
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.7 }}>
                StayWise is Sri Lanka's premier property rental management platform, connecting 
                property owners with tenants through a secure, transparent, and user-friendly system. 
                We're transforming how people find, book, and manage rental properties.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  startIcon={<HomeIcon />}
                  onClick={() => navigate('/user-allproperties')}
                >
                  Explore Properties
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large"
                  startIcon={<BusinessCenterIcon />}
                  onClick={() => navigate('/add-property')}
                  sx={{ borderColor: 'white', color: 'white' }}
                >
                  List Your Property
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                position: 'relative', 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                height: 400
              }}>
                <Avatar
                  sx={{ 
                    width: 300, 
                    height: 300, 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    border: '4px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <HomeIcon sx={{ fontSize: 120, color: 'rgba(255,255,255,0.8)' }} />
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Statistics Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Our Impact
          </Typography>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  background: isDark 
                    ? 'linear-gradient(135deg, #424242 0%, #616161 100%)'
                    : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  border: 'none',
                  boxShadow: 3
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    width: 60, 
                    height: 60, 
                    mx: 'auto', 
                    mb: 2 
                  }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Mission, Vision, Values */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Our Mission & Vision
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                p: 4, 
                height: '100%',
                background: isDark ? theme.cardBackground : '#fff',
                border: isDark ? `1px solid ${theme.border}` : 'none'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Our Mission
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  To democratize property rentals by creating a transparent, secure, and efficient 
                  platform that connects property owners with tenants, making quality accommodation 
                  accessible to everyone while ensuring fair and safe transactions.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                p: 4, 
                height: '100%',
                background: isDark ? theme.cardBackground : '#fff',
                border: isDark ? `1px solid ${theme.border}` : 'none'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <AutoAwesomeIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Our Vision
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  To become South Asia's leading property rental platform, transforming how people 
                  discover, book, and manage accommodations through innovative technology, 
                  exceptional user experience, and unwavering commitment to trust and quality.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Core Values */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Our Core Values
          </Typography>
          <Grid container spacing={3}>
            {values.map((value, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  p: 3, 
                  textAlign: 'center', 
                  height: '100%',
                  background: isDark ? theme.cardBackground : '#fff',
                  border: isDark ? `1px solid ${theme.border}` : 'none',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                    transition: 'all 0.3s ease'
                  }
                }}>
                  <Avatar sx={{ 
                    bgcolor: `${value.color}.main`, 
                    width: 50, 
                    height: 50, 
                    mx: 'auto', 
                    mb: 2 
                  }}>
                    {value.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {value.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Services Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            What We Offer
          </Typography>
          <Grid container spacing={4}>
            {services.map((service, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ 
                  p: 3, 
                  height: '100%',
                  background: isDark ? theme.cardBackground : '#fff',
                  border: isDark ? `1px solid ${theme.border}` : 'none',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    mb: 2,
                    width: 56,
                    height: 56
                  }}>
                    {service.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {service.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {service.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* How It Works Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            How StayWise Works
          </Typography>
          <Grid container spacing={4}>
            {howItWorks.map((step, index) => (
              <Grid item xs={12} sm={6} md={2.4} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Avatar sx={ { 
                      bgcolor: 'primary.main', 
                      width: 80, 
                      height: 80, 
                      mx: 'auto',
                      fontSize: '2rem',
                      fontWeight: 'bold'
                    }}>
                      {step.step}
                    </Avatar>
                    <Avatar sx={{ 
                      bgcolor: 'secondary.main', 
                      width: 40, 
                      height: 40,
                      position: 'absolute',
                      bottom: -10,
                      right: '50%',
                      transform: 'translateX(50%)'
                    }}>
                      {step.icon}
                    </Avatar>
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Team Section */}
        {/* <Box sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Meet Our Team
          </Typography>
          <Grid container spacing={4}>
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  background: isDark ? theme.cardBackground : '#fff',
                  border: isDark ? `1px solid ${theme.border}` : 'none',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease'
                  }
                }}>
                  <Avatar sx={{ 
                    width: 100, 
                    height: 100, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'primary.main'
                  }}>
                    {member.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {member.name}
                  </Typography>
                  <Chip 
                    label={member.role} 
                    color="primary" 
                    size="small" 
                    sx={{ mb: 2 }} 
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {member.bio}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box> */}

        {/* Company Timeline */}
        {/* <Box sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Our Journey
          </Typography>
          <Paper sx={{ 
            p: 4,
            background: isDark ? theme.cardBackground : '#fff',
            border: isDark ? `1px solid ${theme.border}` : 'none'
          }}>
            <Grid container spacing={4}>
              {achievements.map((achievement, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box>
                    <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {achievement.year}
                    </Typography>
                    <Typography variant="body1" gutterBottom sx={{ fontWeight: 'medium' }}>
                      {achievement.milestone}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={achievement.progress} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: isDark ? theme.inputBackground : '#e0e0e0'
                      }} 
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box> */}

        {/* Technology Stack */}
    {/* Technology Stack */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Built with Modern Technology
          </Typography>
          <Grid container spacing={3} justifyContent="center"> {/* Add justifyContent="center" */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                p: 3, 
                textAlign: 'center',
                background: isDark ? theme.cardBackground : '#fff',
                border: isDark ? `1px solid ${theme.border}` : 'none'
              }}>
                <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Azure Cloud</Typography>
                <Typography variant="body2" color="text.secondary">
                  Scalable cloud storage and computing
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                p: 3, 
                textAlign: 'center',
                background: isDark ? theme.cardBackground : '#fff',
                border: isDark ? `1px solid ${theme.border}` : 'none'
              }}>
                <PaymentIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Stripe Payments</Typography>
                <Typography variant="body2" color="text.secondary">
                  Secure payment processing
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                p: 3, 
                textAlign: 'center',
                background: isDark ? theme.cardBackground : '#fff',
                border: isDark ? `1px solid ${theme.border}` : 'none'
              }}>
                <NotificationsIcon sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>Real-time Alerts</Typography>
                <Typography variant="body2" color="text.secondary">
                  WhatsApp and push notifications
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>


        {/* Contact Information */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            Get in Touch
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                p: 4, 
                textAlign: 'center',
                background: isDark ? theme.cardBackground : '#fff',
                border: isDark ? `1px solid ${theme.border}` : 'none'
              }}>
                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 60, height: 60 }}>
                  <PhoneIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom>Call Us</Typography>
                <Typography variant="body1" color="primary.main" sx={{ fontWeight: 'medium' }}>
                  +94 76 172 3207
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mon - Fri: 8AM - 8PM
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                p: 4, 
                textAlign: 'center',
                background: isDark ? theme.cardBackground : '#fff',
                border: isDark ? `1px solid ${theme.border}` : 'none'
              }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2, width: 60, height: 60 }}>
                  <EmailIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom>Email Us</Typography>
                <Typography variant="body1" color="primary.main" sx={{ fontWeight: 'medium' }}>
                  staywise.lk.team@gmail.com

                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We'll reply within 24 hours
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                p: 4, 
                textAlign: 'center',
                background: isDark ? theme.cardBackground : '#fff',
                border: isDark ? `1px solid ${theme.border}` : 'none'
              }}>
                <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2, width: 60, height: 60 }}>
                  <LocationOnIcon />
                </Avatar>
                <Typography variant="h6" gutterBottom>Visit Us</Typography>
                <Typography variant="body1" color="primary.main" sx={{ fontWeight: 'medium' }}>
                  Colombo 03, Sri Lanka
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  123 Business District
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Call to Action */}
        <Box sx={{ 
          textAlign: 'center',
          p: 6,
          background: isDark 
            ? 'linear-gradient(135deg, #424242 0%, #616161 100%)'
            : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          borderRadius: 3,
          mb: 4
        }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.8 }}>
            Join thousands of satisfied users on StayWise today
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/user-allproperties')}
              sx={{ minWidth: 200 }}
            >
              Find Properties
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              startIcon={<BusinessCenterIcon />}
              onClick={() => navigate('/add-property')}
              sx={{ minWidth: 200 }}
            >
              List Your Property
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutUsPage;