import { Container, Grid, Tab, Tabs, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getAllProperties, getProperties } from '../../api/propertyApi';
import PropertyGrid from '../../components/common/PropertyGrid';

const UserAllProperties = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  
//   useEffect(() => {
//     const fetchProperties = async () => {
//       try {
//         const data = await getAllProperties();
//         setProperties(data);
//         setRecommendedProperties(data.slice(0, 6)); // Top 6 properties
//       } catch (error) {
//         console.error('Error fetching properties:', error);
//       }
//     };
//     fetchProperties();
//   }, []);

//   console.log({properties})
  
//   const filterProperties = (category) => {
//     // console.log({properties});
//     return properties.filter((property) => {
//         console.log(property.property_type, category); 
//         return property.property_type === category; // Explicitly returning the condition
//     });
// };


  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <TextField
        label="Search by location"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* Recommended Properties */}
      <Typography variant="h5" gutterBottom>
        Recommended Properties
      </Typography>
      <Grid container spacing={3} >
        {/* {recommendedProperties.map((property) => ( */}
          <Grid item xs={12} sm={12} md={12}
        //    key={property.id}
        >
            <PropertyGrid isUserPage={true} limit={3} />
          </Grid>
        {/* ))} */}
      </Grid>

      <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} >
        <Tab label="Apartment" />
        <Tab label="Villa" />
        <Tab label="Flat" />
        <Tab label="Room" />
      </Tabs>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {selectedTab === 0 && 
        // filterProperties('Apartment').map((property) => (
          <Grid item xs={12} sm={12} md={12} 
        //   key={property.id} 
          >
            <PropertyGrid isUserPage={true} filters={"Apartment"}/>
          </Grid>
        // ))
        }
        {selectedTab === 1 && 
        // filterProperties('Villa').map((property) => (
          <Grid item xs={12} sm={12} md={12} 
        //   key={property.id}
          >
            <PropertyGrid isUserPage={true} filters={"Villa"}/>
            </Grid>
        // ))
        }
        {selectedTab === 2 && 
        // filterProperties('Flat').map((property) => (
          <Grid item xs={12} sm={12} md={12} 
        //   key={property.id}
          >
            <PropertyGrid isUserPage={true} filters={"Flat"}/>
            </Grid>
        // ))
        }
        {selectedTab === 3 && 
        // filterProperties('Room').map((property) => (
          <Grid item xs={12} sm={12} md={12} 
        //   key={property.id}
          >
            <PropertyGrid isUserPage={true} filters={"Room"}/>
            </Grid>
        // ))
        }
      </Grid>
    </Container>
  );
};

export default UserAllProperties;