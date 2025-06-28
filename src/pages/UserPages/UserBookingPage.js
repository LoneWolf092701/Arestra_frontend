import React, { useState } from "react";
import {
  Container,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Divider,
  Alert,
  Checkbox,
  IconButton,
  LinearProgress
} from "@mui/material";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InfoIcon from '@mui/icons-material/Info';
import { useTheme } from '../../contexts/ThemeContext';
import { useParams } from 'react-router-dom';

const UserBookingPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { theme, isDark } = useTheme();
  const { id } = useParams(); // Property ID from route params

  // Form states
  const [personalDetails, setPersonalDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+94',
    mobileNumber: '',
    birthdate: '',
    gender: '',
    nationality: '',
    occupation: '',
    field: '',
    destination: '',
    relocationDetails: ''
  });

  const [paymentDetails, setPaymentDetails] = useState({
    paymentMethod: 'bank',
    paymentProof: null,
    verificationDocument: '',
    verificationFile: null,
    agreeTerms: false
  });

  const steps = ["Booking Overview", "Personal Details", "Payment"];

  // Mock property data - in real app, fetch from API
  const propertyData = {
    title: "Cozy Private Room for Rent Near Colombo City Center",
    address: "100, Sea Street, Colombo 02",
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    price: 150000,
    serviceFee: 300,
    moveInDate: "25 Jan, 2025",
    moveOutDate: "25 Feb, 2025"
  };

  const BookingSummary = () => (
    <Card 
      variant="outlined" 
      sx={{ 
        backgroundColor: theme.cardBackground,
        border: `1px solid ${theme.border}`,
        position: 'sticky',
        top: 20
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ color: theme.textPrimary, fontWeight: 600 }}>
          {propertyData.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {propertyData.address}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {propertyData.bedrooms} Bedrooms • {propertyData.bathrooms} Bathrooms • {propertyData.parking} Parking
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ color: theme.textPrimary, mb: 2 }}>
            Move In/Out Dates
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ 
                p: 2, 
                backgroundColor: theme.surfaceBackground, 
                borderRadius: 1,
                textAlign: 'center'
              }}>
                <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                  Move In
                </Typography>
                <Typography variant="body2" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
                  {propertyData.moveInDate}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ 
                p: 2, 
                backgroundColor: theme.surfaceBackground, 
                borderRadius: 1,
                textAlign: 'center'
              }}>
                <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                  Move Out
                </Typography>
                <Typography variant="body2" sx={{ color: theme.textPrimary, fontWeight: 600 }}>
                  {propertyData.moveOutDate}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Alert severity="info" sx={{ mb: 3, fontSize: '0.875rem' }}>
          You will be charged once the owner accepts your request
        </Alert>

        <Box>
          <Typography variant="subtitle2" sx={{ color: theme.textPrimary, mb: 2 }}>
            Bill Details
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Rental for the first Month</Typography>
            <Typography variant="body2">Rs. {propertyData.price.toLocaleString()}.00</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2">One time service fee</Typography>
            <Typography variant="body2">Rs. {propertyData.serviceFee.toLocaleString()}.00</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Sub Total</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Rs. {(propertyData.price + propertyData.serviceFee).toLocaleString()}.00
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const BookingLayout = ({ children }) => (
    <Grid container spacing={4}>
      <Grid item xs={12} md={7}>
        {children}
      </Grid>
      <Grid item xs={12} md={5}>
        <BookingSummary />
      </Grid>
    </Grid>
  );

  const BookingOverview = () => (
    <BookingLayout>
      <Card variant="outlined" sx={{ backgroundColor: theme.cardBackground }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: theme.textPrimary, fontWeight: 600 }}>
            Next Steps – Payment Procedure
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: theme.primary, mb: 2 }}>
              1. After Request is Sent
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, color: theme.textSecondary }}>
                • The landlord will review your request.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: theme.textSecondary }}>
                • Once the landlord accepts the request, you will receive a confirmation message.
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: theme.textSecondary }}>
                • The landlord's account number will also be shared with you for payment.
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ color: theme.primary, mb: 2 }}>
              2. Payment Submission
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, color: theme.textSecondary }}>
                • Make the payment to the provided account.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: theme.textSecondary }}>
                • Upload the payment receipt (photo or screenshot) via the platform and relevant details.
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: theme.textSecondary }}>
                • Your submission will be sent to the landlord for verification.
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ color: theme.primary, mb: 2 }}>
              3. Booking Confirmation
            </Typography>
            <Box sx={{ pl: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, color: theme.textSecondary }}>
                • Once the landlord approves the payment, your booking is confirmed.
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: theme.textSecondary }}>
                • You will receive a final confirmation once this step is completed.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            p: 3, 
            backgroundColor: theme.surfaceBackground, 
            borderRadius: 2,
            border: `1px solid ${theme.border}`,
            mb: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon sx={{ color: theme.primary, mr: 1 }} />
              <Typography variant="h6" sx={{ color: theme.primary }}>On Move In</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: theme.textSecondary }}>
              You have 24 hours to report any issues with the accommodation.
            </Typography>
          </Box>

          <Box sx={{ 
            p: 3, 
            backgroundColor: theme.surfaceBackground, 
            borderRadius: 2,
            border: `1px solid ${theme.border}`
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon sx={{ color: theme.primary, mr: 1 }} />
              <Typography variant="h6" sx={{ color: theme.primary }}>On Move Out</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 1 }}>
              If the property is in good condition, the landlord should return your security deposit.
            </Typography>
            <Typography variant="body2" sx={{ color: theme.textSecondary }}>
              If you leave before the agreed date, the landlord may retain the deposit.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </BookingLayout>
  );

  const PersonalDetailsForm = () => (
    <BookingLayout>
      <Card variant="outlined" sx={{ backgroundColor: theme.cardBackground }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: theme.textPrimary, fontWeight: 600 }}>
            Personal Details
          </Typography>

          <Grid container spacing={3}>
            {/* First & Last Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name*"
                variant="outlined"
                fullWidth
                value={personalDetails.firstName}
                onChange={(e) => setPersonalDetails(prev => ({...prev, firstName: e.target.value}))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name*"
                variant="outlined"
                fullWidth
                value={personalDetails.lastName}
                onChange={(e) => setPersonalDetails(prev => ({...prev, lastName: e.target.value}))}
                required
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12}>
              <TextField
                label="Email address*"
                variant="outlined"
                type="email"
                fullWidth
                value={personalDetails.email}
                onChange={(e) => setPersonalDetails(prev => ({...prev, email: e.target.value}))}
                required
              />
            </Grid>

            {/* Mobile Number */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Country Code"
                variant="outlined"
                fullWidth
                value={personalDetails.countryCode}
                onChange={(e) => setPersonalDetails(prev => ({...prev, countryCode: e.target.value}))}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Mobile Number*"
                variant="outlined"
                fullWidth
                value={personalDetails.mobileNumber}
                onChange={(e) => setPersonalDetails(prev => ({...prev, mobileNumber: e.target.value}))}
                required
              />
            </Grid>

            {/* Birthdate */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Birthdate*"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={personalDetails.birthdate}
                onChange={(e) => setPersonalDetails(prev => ({...prev, birthdate: e.target.value}))}
                required
              />
            </Grid>

            {/* Gender */}
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" sx={{ mt: 1 }}>
                <FormLabel component="legend" sx={{ color: theme.textPrimary }}>Gender*</FormLabel>
                <RadioGroup
                  row
                  value={personalDetails.gender}
                  onChange={(e) => setPersonalDetails(prev => ({...prev, gender: e.target.value}))}
                >
                  <FormControlLabel value="Male" control={<Radio />} label="Male" />
                  <FormControlLabel value="Female" control={<Radio />} label="Female" />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Nationality & Occupation */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nationality*"
                variant="outlined"
                fullWidth
                placeholder="Select your country of origin"
                value={personalDetails.nationality}
                onChange={(e) => setPersonalDetails(prev => ({...prev, nationality: e.target.value}))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Occupation*"
                variant="outlined"
                fullWidth
                value={personalDetails.occupation}
                onChange={(e) => setPersonalDetails(prev => ({...prev, occupation: e.target.value}))}
                required
              />
            </Grid>

            {/* Field & Destination */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Field*"
                variant="outlined"
                fullWidth
                value={personalDetails.field}
                onChange={(e) => setPersonalDetails(prev => ({...prev, field: e.target.value}))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Destination University / Place of work"
                variant="outlined"
                fullWidth
                placeholder="Optional"
                value={personalDetails.destination}
                onChange={(e) => setPersonalDetails(prev => ({...prev, destination: e.target.value}))}
              />
            </Grid>

            {/* About yourself section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ color: theme.textPrimary, mb: 2 }}>
                About yourself
                <Typography component="span" sx={{ color: theme.textSecondary, ml: 1 }}>
                  (Optional)
                </Typography>
              </Typography>
              <TextField
                label="Relocation Details"
                placeholder="Why are you relocating? Will you be studying or working? Are you moving alone or with someone? If with others, who are they?"
                variant="outlined"
                multiline
                rows={4}
                fullWidth
                value={personalDetails.relocationDetails}
                onChange={(e) => setPersonalDetails(prev => ({...prev, relocationDetails: e.target.value}))}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </BookingLayout>
  );

  const PaymentForm = () => (
    <BookingLayout>
      <Card variant="outlined" sx={{ backgroundColor: theme.cardBackground }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: theme.textPrimary, fontWeight: 600 }}>
            Payment
          </Typography>

          {/* Payment Method Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: theme.textPrimary }}>
              Payment Method
            </Typography>
            <Box sx={{ 
              p: 3, 
              backgroundColor: theme.surfaceBackground, 
              borderRadius: 2,
              border: `1px solid ${theme.border}`,
              mb: 3
            }}>
              <Typography variant="body1" sx={{ color: theme.textPrimary, mb: 2, fontWeight: 600 }}>
                Please upload proof of full payment (total amount).
              </Typography>
              <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 2 }}>
                It can be a clear image or screenshot of the receipt (.jpg, .png, max 2MB). 
                If the file is unclear, incomplete, or incorrect, it will be rejected.
              </Typography>
              <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                Booking will be confirmed only after the property owner verifies and approves the payment.
              </Typography>
              
              <Box sx={{ 
                mt: 3, 
                p: 3, 
                border: `2px dashed ${theme.border}`,
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: theme.hover
                }
              }}>
                <UploadFileIcon sx={{ fontSize: 48, color: theme.textSecondary, mb: 2 }} />
                <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                  Click to upload or drag and drop
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }}>
                  Browse files
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Landlord Requirements Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: theme.textPrimary }}>
              Landlord Requirements*
            </Typography>
            <Typography variant="subtitle1" gutterBottom sx={{ color: theme.textPrimary }}>
              NIC No / Passport No*
            </Typography>
            
            <Box sx={{ 
              p: 3, 
              backgroundColor: theme.surfaceBackground, 
              borderRadius: 2,
              border: `1px solid ${theme.border}`,
              mb: 3
            }}>
              <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 3 }}>
                This Landlord requires certain documentation to be provided 
                in order to have a successful Booking. You can upload the 
                required documents now or at a later date.
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <TextField
                  select
                  label="Please Select a Verification Document"
                  value={paymentDetails.verificationDocument}
                  onChange={(e) => setPaymentDetails(prev => ({...prev, verificationDocument: e.target.value}))}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select Document Type</option>
                  <option value="nic">National Identity Card</option>
                  <option value="passport">Passport</option>
                  <option value="license">Driving License</option>
                </TextField>
              </FormControl>

              <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 2 }}>
                Please Upload the copy of the above selected document*
              </Typography>

              <Box sx={{ 
                p: 3, 
                border: `2px dashed ${theme.border}`,
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: theme.hover
                }
              }}>
                <UploadFileIcon sx={{ fontSize: 48, color: theme.textSecondary, mb: 2 }} />
                <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                  Click to upload or drag and drop
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }}>
                  Browse files
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Terms and Conditions */}
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={paymentDetails.agreeTerms}
                  onChange={(e) => setPaymentDetails(prev => ({...prev, agreeTerms: e.target.checked}))}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ color: theme.textSecondary }}>
                  I agree with the Terms & Conditions
                </Typography>
              }
            />
          </Box>
        </CardContent>
      </Card>
    </BookingLayout>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <BookingOverview />;
      case 1:
        return <PersonalDetailsForm />;
      case 2:
        return <PaymentForm />;
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      // Handle form submission on final step
      handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    console.log('Submitting booking request...', { personalDetails, paymentDetails });
    // Implement actual booking submission here
    alert('Booking request submitted successfully!');
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return true; // No validation needed for overview
      case 1:
        return personalDetails.firstName && personalDetails.lastName && 
               personalDetails.email && personalDetails.mobileNumber &&
               personalDetails.birthdate && personalDetails.gender &&
               personalDetails.nationality && personalDetails.occupation &&
               personalDetails.field;
      case 2:
        return paymentDetails.agreeTerms && paymentDetails.verificationDocument;
      default:
        return false;
    }
  };

  return (
    <Box sx={{ 
      background: isDark 
        ? `linear-gradient(135deg, ${theme.background} 0%, ${theme.surfaceBackground} 50%, ${theme.background} 100%)`
        : `linear-gradient(135deg, ${theme.background} 0%, ${theme.primary}05 50%, ${theme.background} 100%)`,
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Breadcrumb */}
        <Typography variant="body2" sx={{ color: theme.textSecondary, mb: 2 }}>
          Home / Booking
        </Typography>

        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: activeStep === index ? theme.primary : theme.textSecondary,
                      fontWeight: activeStep === index ? 600 : 400,
                    },
                    '& .MuiStepIcon-root': {
                      color: activeStep >= index ? theme.primary : theme.textDisabled,
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Progress bar */}
          <LinearProgress 
            variant="determinate" 
            value={(activeStep / (steps.length - 1)) * 100} 
            sx={{ 
              mt: 2, 
              height: 6, 
              borderRadius: 3,
              backgroundColor: theme.surfaceBackground,
              '& .MuiLinearProgress-bar': {
                backgroundColor: theme.primary,
              }
            }} 
          />
        </Box>

        {/* Step Content */}
        <Box sx={{ mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            sx={{
              borderColor: theme.textSecondary,
              color: theme.textSecondary,
              '&:hover': {
                backgroundColor: `${theme.textSecondary}10`,
              },
              px: 4,
              py: 1.5
            }}
          >
            Back
          </Button>
          
          <Button 
            onClick={handleNext} 
            variant="contained" 
            disabled={!isStepValid()}
            sx={{
              backgroundColor: theme.primary,
              color: isDark ? theme.textPrimary : '#FFFFFF',
              '&:hover': {
                backgroundColor: theme.secondary,
              },
              px: 4,
              py: 1.5
            }}
          >
            {activeStep === steps.length - 1 ? "Confirm Booking" : "Next"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default UserBookingPage;