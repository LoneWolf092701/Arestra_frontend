import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import ChatIcon from '@mui/icons-material/Chat';
import { useTheme } from '../contexts/ThemeContext';

const HelpSupport = () => {
  const { theme } = useTheme();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (field) => (event) => {
    setContactForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const faqs = [
    {
      question: "How do I search for properties?",
      answer: "Use the search bar on the home page to enter location, property type, or keywords. You can also use filters to narrow down your results."
    },
    {
      question: "How do I book a property?",
      answer: "Click on a property, view details, select dates, and click 'Book Now'. Follow the booking process and submit required documents."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept bank transfers, online payments, and cash deposits. Specific methods depend on the property owner."
    },
    {
      question: "How do I contact property owners?",
      answer: "Use the contact form on each property listing or the messaging system after creating an account."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Cancellation policies vary by property. Check the cancellation terms before booking or contact support for assistance."
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: theme.background, py: 4 }}>
      <Container maxWidth="lg">
        
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: theme.textPrimary, mb: 2 }}>
            Help & Support
          </Typography>
          <Typography variant="h6" sx={{ color: theme.textSecondary, maxWidth: 600, mx: 'auto' }}>
            Get answers to common questions or reach out to our support team
          </Typography>
        </Box>

        <Grid container spacing={4}>
          
          {/* FAQ Section */}
          <Grid item xs={12} md={8}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: theme.textPrimary, mb: 3 }}>
              Frequently Asked Questions
            </Typography>
            
            {faqs.map((faq, index) => (
              <Accordion key={index} sx={{ mb: 1, backgroundColor: theme.cardBackground }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontWeight: 500, color: theme.textPrimary }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography sx={{ color: theme.textSecondary, lineHeight: 1.6 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>

          {/* Contact Section */}
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: theme.cardBackground, mb: 4 }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.textPrimary, mb: 3 }}>
                  Contact Us
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ color: theme.primary, mr: 2 }} />
                  <Typography sx={{ color: theme.textSecondary }}>
                    support@staywise.com
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ color: theme.primary, mr: 2 }} />
                  <Typography sx={{ color: theme.textSecondary }}>
                    +94 11 234 5678
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <ChatIcon sx={{ color: theme.primary, mr: 2 }} />
                  <Typography sx={{ color: theme.textSecondary }}>
                    Live Chat: 9AM - 6PM
                  </Typography>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.textPrimary, mb: 2 }}>
                  Send us a message
                </Typography>

                {submitSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Message sent successfully! We'll get back to you soon.
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={contactForm.name}
                    onChange={handleInputChange('name')}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={contactForm.email}
                    onChange={handleInputChange('email')}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Subject"
                    value={contactForm.subject}
                    onChange={handleInputChange('subject')}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Message"
                    multiline
                    rows={4}
                    value={contactForm.message}
                    onChange={handleInputChange('message')}
                    margin="normal"
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      mt: 2,
                      backgroundColor: theme.primary,
                      '&:hover': { backgroundColor: theme.secondary }
                    }}
                  >
                    Send Message
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
};

export default HelpSupport;