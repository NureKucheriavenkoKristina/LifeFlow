
import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import apiClient, { endpoints } from '../../utils/apiClient';

const DonorQuestionnaire = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState(null);
  const [medicalInfo, setMedicalInfo] = useState(null);

  const getDefaultBirthDay = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split('T')[0];
  };
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formType, setFormType] = useState('basic');
  const [basicInfo, setBasicInfo] = useState({
    gender: '',
    birthDay: getDefaultBirthDay(),
    weight: '',
    bloodType: '',
    bloodResus: '',
    donationTypeOffered: 'WHOLE_BLOOD',
    consentToDataProcessing: false,
    allowProfileVisibility: false
  });
  

  const [disqualifyingConditions, setDisqualifyingConditions] = useState({
    HIV_AIDS: false,
    hepatitisBorC: false,
    syphilis: false,
    tuberculosisActiveOrPast: false,
    oncologicalDiseases: false,
    diabetesMellitus: false,
    heartAndVascularDiseases: false,
    centralNervousSystemDiseases: false,
    autoimmuneDiseases: false,
    bloodDiseases: false,
  });
  

  const [temporaryConditions, setTemporaryConditions] = useState({
    hasRecentUpgade: false,
    upgadeDate: '',
    acuteRespiratoryInfections: false,
    respiratoryInfectionsDate: '',
    antibioticTherapy: false,
    antibioticTherapyDate: '',
    vaccination: false,
    vaccinationDate: '',
    surgeriesInjuriesStitches: false,
    surgeriesInjuriesStitchesDate: '',
    pregnancy: false,
    pregnancyDate: '',
    dentalPocedures: false,
    dentalPoceduresDate: '',
    herpesSimplex: false,
    herpesSimplexDate: '',
  });
  

  const renderProgressIndicator = () => {
    return (
      <div className="bg-gray-100 py-4 px-6 mb-6 rounded-lg">
        <div className="relative">
          {/* Progress bar */}
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-600"
              style={{
                width: formType === 'basic' ? '0%' : formType === 'disqualifying' ? '50%' : '100%'
              }}
            ></div>
          </div>
          
          {/* Progress steps */}
          <div className="flex text-sm justify-between">
            <div className="text-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mx-auto mb-1 ${
                formType === 'basic' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white border border-red-600 text-red-600'
              }`}>
                {formType === 'basic' ? '1' : '✓'}
              </div>
              <span className={formType === 'basic' ? 'text-red-600 font-medium' : 'text-gray-600'}>
                Basic Info
              </span>
            </div>
            
            <div className="text-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mx-auto mb-1 ${
                formType === 'disqualifying' 
                  ? 'bg-red-600 text-white' 
                  : formType === 'temporary' 
                    ? 'bg-white border border-red-600 text-red-600' 
                    : 'bg-white border border-gray-300 text-gray-400'
              }`}>
                {formType === 'temporary' ? '✓' : '2'}
              </div>
              <span className={formType === 'disqualifying' ? 'text-red-600 font-medium' : 'text-gray-600'}>
                Medical History
              </span>
            </div>
            
            <div className="text-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mx-auto mb-1 ${
                formType === 'temporary' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white border border-gray-300 text-gray-400'
              }`}>
                3
              </div>
              <span className={formType === 'temporary' ? 'text-red-600 font-medium' : 'text-gray-600'}>
                Temporary Conditions
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        setLoading(true);
        

        const response = await apiClient.get(endpoints.donors.profile);
        setProfile(response.data.donorProfile);
        setMedicalInfo(response.data.medicalInfo);
        

        if (response.data.donorProfile) {
          const donor = response.data.donorProfile;
          
          setBasicInfo({
            gender: donor.gender || '',
            birthDay: donor.birthDay
                ? new Date(donor.birthDay).toISOString().split('T')[0]
                : getDefaultBirthDay(),
            weight: donor.weight || '',
            bloodType: donor.bloodType || '',
            bloodResus: donor.bloodResus || '',
            donationTypeOffered: 'WHOLE_BLOOD',
            consentToDataProcessing: donor.consentToDataProcessing || false,
            allowProfileVisibility: donor.allowProfileVisibility || false
          });
        }
        
        if (response.data.medicalInfo) {
          const medical = response.data.medicalInfo;
          

          setDisqualifyingConditions({
            HIV_AIDS: medical.HIV_AIDS || false,
            hepatitisBorC: medical.hepatitisBorC || false,
            syphilis: medical.syphilis || false,
            tuberculosisActiveOrPast: medical.tuberculosisActiveOrPast || false,
            oncologicalDiseases: medical.oncologicalDiseases || false,
            diabetesMellitus: medical.diabetesMellitus || false,
            heartAndVascularDiseases: medical.heartAndVascularDiseases || false,
            centralNervousSystemDiseases: medical.centralNervousSystemDiseases || false,
            autoimmuneDiseases: medical.autoimmuneDiseases || false,
            bloodDiseases: medical.bloodDiseases || false,
          });
          

          setTemporaryConditions({
            hasRecentUpgade: medical.hasRecentUpgade || false,
            upgadeDate: medical.upgadeDate ? new Date(medical.upgadeDate).toISOString().split('T')[0] : '',
            acuteRespiratoryInfections: medical.acuteRespiratoryInfections || false,
            respiratoryInfectionsDate: medical.respiratoryInfectionsDate ? new Date(medical.respiratoryInfectionsDate).toISOString().split('T')[0] : '',
            antibioticTherapy: medical.antibioticTherapy || false,
            antibioticTherapyDate: medical.antibioticTherapyDate ? new Date(medical.antibioticTherapyDate).toISOString().split('T')[0] : '',
            vaccination: medical.vaccination || false,
            vaccinationDate: medical.vaccinationDate ? new Date(medical.vaccinationDate).toISOString().split('T')[0] : '',
            surgeriesInjuriesStitches: medical.surgeriesInjuriesStitches || false,
            surgeriesInjuriesStitchesDate: medical.surgeriesInjuriesStitchesDate ? new Date(medical.surgeriesInjuriesStitchesDate).toISOString().split('T')[0] : '',
            pregnancy: medical.pregnancy || false,
            pregnancyDate: medical.pregnancyDate ? new Date(medical.pregnancyDate).toISOString().split('T')[0] : '',
            dentalPocedures: medical.dentalPocedures || false,
            dentalPoceduresDate: medical.dentalPoceduresDate ? new Date(medical.dentalPoceduresDate).toISOString().split('T')[0] : '',
            herpesSimplex: medical.herpesSimplex || false,
            herpesSimplexDate: medical.herpesSimplexDate ? new Date(medical.herpesSimplexDate).toISOString().split('T')[0] : '',
          });
          

          if (medical.donationTypeOffered) {
            setBasicInfo(prev => ({
              ...prev,
              donationTypeOffered: medical.donationTypeOffered
            }));
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch donor data:', err);
        setError('Failed to load your profile data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDonorData();
  }, []);
  
  const handleBasicInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBasicInfo({
      ...basicInfo,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleDisqualifyingConditionsChange = (e) => {
    const { name, checked } = e.target;
    setDisqualifyingConditions({
      ...disqualifyingConditions,
      [name]: checked
    });
  };
  
  const handleTemporaryConditionsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTemporaryConditions({
      ...temporaryConditions,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();
    const today = new Date();
    const birthDate = new Date(basicInfo.birthDay);
    const minBirthDate = new Date();
    minBirthDate.setFullYear(today.getFullYear() - 18);

    if (birthDate > minBirthDate) {
      setError('You must be at least 18 years old to donate blood.');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      

      const formattedData = { ...basicInfo };
      

      if (formattedData.birthDay) {
        try {
          const date = new Date(formattedData.birthDay);

          formattedData.birthDay = date.toISOString().split('T')[0];
        } catch (dateError) {
          console.error('Invalid birth date format:', dateError);
        }
      }
      
      console.log('Submitting data:', formattedData);
      

      const response = await apiClient.put(endpoints.donors.profile, formattedData);
      console.log('Response:', response);
      

      setFormType('disqualifying');
      setSubmitting(false);
    } catch (err) {
      console.error('Failed to update basic info:', err);
      

      if (err.response) {
        console.error('Error response:', err.response.data);
      }
      
      const errorMessage = 
        err.response?.data?.message || 
        'Failed to update your profile. Please try again.';
      
      setError(errorMessage);
      setSubmitting(false);
    }
  };
  
  const handleDisqualifyingConditionsSubmit = async (e) => {
    e.preventDefault();
    

    setFormType('temporary');
  };

  const handleTemporaryConditionsSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);


      const formattedTemporaryConditions = { ...temporaryConditions };
      const dateFields = [
        'upgadeDate', 'respiratoryInfectionsDate', 'antibioticTherapyDate',
        'vaccinationDate', 'surgeriesInjuriesStitchesDate',
        'pregnancyDate', 'dentalPoceduresDate', 'herpesSimplexDate'
      ];

      dateFields.forEach(field => {
        const baseField = field.replace('Date', '');
        if (!temporaryConditions[baseField]) {
          delete formattedTemporaryConditions[field];
        } else if (temporaryConditions[field]) {
          try {
            const date = new Date(temporaryConditions[field]);
            formattedTemporaryConditions[field] = date.toISOString().split('T')[0];
          } catch (dateError) {
            console.error(`Invalid date format for ${field}:`, dateError);
            formattedTemporaryConditions[field] = new Date().toISOString().split('T')[0];
          }
        } else {
          formattedTemporaryConditions[field] = new Date().toISOString().split('T')[0];
        }
      });


      const medicalData = {
        ...disqualifyingConditions,
        ...formattedTemporaryConditions,
        donationTypeOffered: basicInfo.donationTypeOffered
      };

      console.log('Submitting medical data:', medicalData);


      const response = await apiClient.post(endpoints.donors.medicalInfo, medicalData);

      console.log('Medical info submission successful:', response.data);


      try {
        const nextDonationResponse = await apiClient.get(endpoints.donors.nextDonationDate);


        localStorage.setItem('nextDonationDate', nextDonationResponse.data.nextDonationDate);
        localStorage.setItem('medicalRestrictions', JSON.stringify(nextDonationResponse.data.medicalRestrictions || []));

        console.log('Updated next donation date:', nextDonationResponse.data.nextDonationDate);
      } catch (fetchError) {
        console.error('Failed to fetch updated next donation date:', fetchError);
      }

      setSuccess(true);
      setSubmitting(false);

      setTimeout(() => {
        navigate('/donor/dashboard', { state: { reload: true } });
      }, 1000);

    } catch (err) {
      console.error('Failed to submit medical questionnaire:', err);

      const errorMessage =
          err.validationError ||
          err.response?.data?.message ||
          'Failed to submit your medical information. Please try again.';

      setError(errorMessage);
      setSubmitting(false);
    }
  };



  const goBack = () => {
    if (formType === 'disqualifying') {
      setFormType('basic');
    } else if (formType === 'temporary') {
      setFormType('disqualifying');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }
  
  const renderBasicInfoForm = () => {
    return (
      <form onSubmit={handleBasicInfoSubmit} className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
              <p className="mt-1 text-sm text-gray-500">
                This information is required to verify your eligibility as a donor.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                {/* Gender */}
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={basicInfo.gender}
                    onChange={handleBasicInfoChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                
                {/* Birth Date */}
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="birthDay" className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <input
                      type="date"
                      name="birthDay"
                      id="birthDay"
                      required
                      value={basicInfo.birthDay}
                      onChange={handleBasicInfoChange}
                      max={getDefaultBirthDay()}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                </div>
                
                {/* Weight */}
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    id="weight"
                    required
                    min="50"
                    value={basicInfo.weight}
                    onChange={handleBasicInfoChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  />
                  <p className="mt-2 text-sm text-gray-500">Minimum weight required: 50kg</p>
                </div>
                
                {/* Blood Type */}
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700">
                    Blood Type
                  </label>
                  <select
                    id="bloodType"
                    name="bloodType"
                    required
                    value={basicInfo.bloodType}
                    onChange={handleBasicInfoChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Select blood type</option>
                    <option value="I">O (I)</option>
                    <option value="II">A (II)</option>
                    <option value="III">B (III)</option>
                    <option value="IV">AB (IV)</option>
                  </select>
                </div>
                
                {/* Blood Resus */}
                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="bloodResus" className="block text-sm font-medium text-gray-700">
                    Blood Resus Factor
                  </label>
                  <select
                    id="bloodResus"
                    name="bloodResus"
                    required
                    value={basicInfo.bloodResus}
                    onChange={handleBasicInfoChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Select resus factor</option>
                    <option value="POSITIVE">Positive (+)</option>
                    <option value="NEGATIVE">Negative (-)</option>
                  </select>
                </div>
                
                {/* Donation Type */}
                <div className="col-span-6">
                  <label htmlFor="donationTypeOffered" className="block text-sm font-medium text-gray-700">
                    Preferred Donation Type
                  </label>
                  <select
                    id="donationTypeOffered"
                    name="donationTypeOffered"
                    required
                    value={basicInfo.donationTypeOffered}
                    onChange={handleBasicInfoChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="WHOLE_BLOOD">Whole Blood</option>
                    <option value="PLASMA">Plasma</option>
                    <option value="PLATELETS">Platelets</option>
                  </select>
                </div>
                
                {/* Consent to Data Processing */}
                <div className="col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="consentToDataProcessing"
                        name="consentToDataProcessing"
                        type="checkbox"
                        checked={basicInfo.consentToDataProcessing}
                        onChange={handleBasicInfoChange}
                        required
                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="consentToDataProcessing" className="font-medium text-gray-700">
                        Consent to Data Processing
                      </label>
                      <p className="text-gray-500">
                        I consent to the processing of my personal and medical data for the purpose of blood donation.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Profile Visibility */}
                <div className="col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="allowProfileVisibility"
                        name="allowProfileVisibility"
                        type="checkbox"
                        checked={basicInfo.allowProfileVisibility}
                        onChange={handleBasicInfoChange}
                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="allowProfileVisibility" className="font-medium text-gray-700">
                        Allow Profile Visibility
                      </label>
                      <p className="text-gray-500">
                        Allow seekers to find and contact me for blood donation requests.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              submitting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Next: Medical Conditions'}
          </button>
        </div>
      </form>
    );
  };
  
  const renderDisqualifyingConditionsForm = () => {
    return (
      <form onSubmit={handleDisqualifyingConditionsSubmit} className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Disqualifying Conditions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please indicate if you have any of the following conditions. Some conditions may permanently disqualify you from donating blood.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="space-y-6">
                {/* Disqualifying conditions */}
                <div className="space-y-4">
                  {Object.entries({
                    'HIV_AIDS': 'HIV/AIDS',
                    'hepatitisBorC': 'Hepatitis B or C',
                    'syphilis': 'Syphilis',
                    'tuberculosisActiveOrPast': 'Tuberculosis (Active or Past)',
                    'oncologicalDiseases': 'Oncological Diseases (Cancer)',
                    'diabetesMellitus': 'Diabetes Mellitus',
                    'heartAndVascularDiseases': 'Heart and Vascular Diseases',
                    'centralNervousSystemDiseases': 'Central Nervous System Diseases',
                    'autoimmuneDiseases': 'Autoimmune Diseases',
                    'bloodDiseases': 'Blood Diseases or Disorders'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={key}
                          name={key}
                          type="checkbox"
                          checked={disqualifyingConditions[key]}
                          onChange={handleDisqualifyingConditionsChange}
                          className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={key} className="font-medium text-gray-700">
                          {label}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          If you have any of these conditions, you may be permanently disqualified from donating blood. 
                          However, please answer truthfully as your health and the safety of recipients is our primary concern.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={goBack}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Back
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Next: Temporary Conditions
          </button>
        </div>
      </form>
    );
  };
  
  const renderTemporaryConditionsForm = () => {
    return (
      <form onSubmit={handleTemporaryConditionsSubmit} className="space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Temporary Restrictions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Please indicate if you've had any of the following in the recent past. These conditions may temporarily restrict your ability to donate.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="space-y-6">
                {/* Recent tattoo or piercing */}
                <div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="hasRecentUpgade"
                        name="hasRecentUpgade"
                        type="checkbox"
                        checked={temporaryConditions.hasRecentUpgade}
                        onChange={handleTemporaryConditionsChange}
                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="hasRecentUpgade" className="font-medium text-gray-700">
                        Recent tattoo, piercing or permanent makeup
                      </label>
                    </div>
                  </div>
                  {temporaryConditions.hasRecentUpgade && (
                    <div className="mt-3 ml-7">
                      <label htmlFor="upgadeDate" className="block text-sm font-medium text-gray-700">
                        Date of procedure
                      </label>
                      <input
                        type="date"
                        name="upgadeDate"
                        id="upgadeDate"
                        required={temporaryConditions.hasRecentUpgade}
                        value={temporaryConditions.upgadeDate}
                        onChange={handleTemporaryConditionsChange}
                        max={getTodayDate()}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  )}
                </div>
                
                {/* Acute respiratory infections */}
                <div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="acuteRespiratoryInfections"
                        name="acuteRespiratoryInfections"
                        type="checkbox"
                        checked={temporaryConditions.acuteRespiratoryInfections}
                        onChange={handleTemporaryConditionsChange}
                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="acuteRespiratoryInfections" className="font-medium text-gray-700">
                        Recent respiratory infection (cold, flu, etc.)
                      </label>
                    </div>
                  </div>
                  {temporaryConditions.acuteRespiratoryInfections && (
                    <div className="mt-3 ml-7">
                      <label htmlFor="respiratoryInfectionsDate" className="block text-sm font-medium text-gray-700">
                        Date of recovery
                      </label>
                      <input
                        type="date"
                        name="respiratoryInfectionsDate"
                        id="respiratoryInfectionsDate"
                        required={temporaryConditions.acuteRespiratoryInfections}
                        value={temporaryConditions.respiratoryInfectionsDate}
                        onChange={handleTemporaryConditionsChange}
                        max={getTodayDate()}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  )}
                </div>
                
                {/* Antibiotic therapy */}
                <div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="antibioticTherapy"
                        name="antibioticTherapy"
                        type="checkbox"
                        checked={temporaryConditions.antibioticTherapy}
                        onChange={handleTemporaryConditionsChange}
                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="antibioticTherapy" className="font-medium text-gray-700">
                        Recent antibiotic therapy
                      </label>
                    </div>
                  </div>
                  {temporaryConditions.antibioticTherapy && (
                    <div className="mt-3 ml-7">
                      <label htmlFor="antibioticTherapyDate" className="block text-sm font-medium text-gray-700">
                        Date of completion
                      </label>
                      <input
                        type="date"
                        name="antibioticTherapyDate"
                        id="antibioticTherapyDate"
                        required={temporaryConditions.antibioticTherapy}
                        value={temporaryConditions.antibioticTherapyDate}
                        onChange={handleTemporaryConditionsChange}
                        max={getTodayDate()}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  )}
                </div>
                
                {/* Vaccination */}
                <div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="vaccination"
                        name="vaccination"
                        type="checkbox"
                        checked={temporaryConditions.vaccination}
                        onChange={handleTemporaryConditionsChange}
                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="vaccination" className="font-medium text-gray-700">
                        Recent vaccination
                      </label>
                    </div>
                  </div>
                  {temporaryConditions.vaccination && (
                    <div className="mt-3 ml-7">
                      <label htmlFor="vaccinationDate" className="block text-sm font-medium text-gray-700">
                        Date of vaccination
                      </label>
                      <input
                        type="date"
                        name="vaccinationDate"
                        id="vaccinationDate"
                        max={getTodayDate()}
                        required={temporaryConditions.vaccination}
                        value={temporaryConditions.vaccinationDate}
                        onChange={handleTemporaryConditionsChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  )}
                </div>
                
                {/* Surgeries, injuries, stitches */}
                <div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="surgeriesInjuriesStitches"
                        name="surgeriesInjuriesStitches"
                        type="checkbox"
                        checked={temporaryConditions.surgeriesInjuriesStitches}
                        onChange={handleTemporaryConditionsChange}
                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="surgeriesInjuriesStitches" className="font-medium text-gray-700">
                        Recent surgery, injury, or stitches
                      </label>
                    </div>
                  </div>
                  {temporaryConditions.surgeriesInjuriesStitches && (
                    <div className="mt-3 ml-7">
                      <label htmlFor="surgeriesInjuriesStitchesDate" className="block text-sm font-medium text-gray-700">
                        Date of procedure/injury
                      </label>
                      <input
                        type="date"
                        name="surgeriesInjuriesStitchesDate"
                        id="surgeriesInjuriesStitchesDate"
                        required={temporaryConditions.surgeriesInjuriesStitches}
                        value={temporaryConditions.surgeriesInjuriesStitchesDate}
                        onChange={handleTemporaryConditionsChange}
                        max={getTodayDate()}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  )}
                </div>
                
                {/* Pregnancy */}
                {basicInfo.gender === 'FEMALE' && (
                    <div>
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                              id="pregnancy"
                              name="pregnancy"
                              type="checkbox"
                              checked={temporaryConditions.pregnancy}
                              onChange={handleTemporaryConditionsChange}
                              className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="pregnancy" className="font-medium text-gray-700">
                            Recently pregnant or currently pregnant
                          </label>
                        </div>
                      </div>
                      {temporaryConditions.pregnancy && (
                          <div className="mt-3 ml-7">
                            <label htmlFor="pregnancyDate" className="block text-sm font-medium text-gray-700">
                              Date of delivery
                            </label>
                            <input
                                type="date"
                                name="pregnancyDate"
                                id="pregnancyDate"
                                required={temporaryConditions.pregnancy}
                                value={temporaryConditions.pregnancyDate}
                                onChange={handleTemporaryConditionsChange}
                                max={getTodayDate()}
                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            />
                          </div>
                      )}
                    </div>
                )}
                
                {/* Dental procedures */}
                <div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="dentalPocedures"
                        name="dentalPocedures"
                        type="checkbox"
                        checked={temporaryConditions.dentalPocedures}
                        onChange={handleTemporaryConditionsChange}
                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="dentalPocedures" className="font-medium text-gray-700">
                        Recent dental procedures
                      </label>
                    </div>
                  </div>
                  {temporaryConditions.dentalPocedures && (
                    <div className="mt-3 ml-7">
                      <label htmlFor="dentalPoceduresDate" className="block text-sm font-medium text-gray-700">
                        Date of procedure
                      </label>
                      <input
                        type="date"
                        name="dentalPoceduresDate"
                        id="dentalPoceduresDate"
                        required={temporaryConditions.dentalPocedures}
                        value={temporaryConditions.dentalPoceduresDate}
                        onChange={handleTemporaryConditionsChange}
                        max={getTodayDate()}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  )}
                </div>
                
                {/* Herpes simplex */}
                <div>
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="herpesSimplex"
                        name="herpesSimplex"
                        type="checkbox"
                        checked={temporaryConditions.herpesSimplex}
                        onChange={handleTemporaryConditionsChange}
                        className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="herpesSimplex" className="font-medium text-gray-700">
                        Recent herpes simplex outbreak (cold sores)
                      </label>
                    </div>
                  </div>
                  {temporaryConditions.herpesSimplex && (
                    <div className="mt-3 ml-7">
                      <label htmlFor="herpesSimplexDate" className="block text-sm font-medium text-gray-700">
                        Date of recovery
                      </label>
                      <input
                        type="date"
                        name="herpesSimplexDate"
                        id="herpesSimplexDate"
                        required={temporaryConditions.herpesSimplex}
                        value={temporaryConditions.herpesSimplexDate}
                        onChange={handleTemporaryConditionsChange}
                        max={getTodayDate()}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Medical questionnaire submitted successfully!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your information has been submitted for review. You will be redirected to the dashboard shortly.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={goBack}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              submitting ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Submit Medical Questionnaire'}
          </button>
        </div>
      </form>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">Medical Questionnaire</h2>
        <p className="mt-1 text-sm text-gray-500">
          This questionnaire helps us determine your eligibility to donate blood. Please answer all questions truthfully.
          Your medical information will be reviewed by our medical staff and kept confidential.
        </p>
      </div>
      
      {/* Progress steps */}
      {renderProgressIndicator()}
      
      {/* Form sections */}
      {formType === 'basic' && renderBasicInfoForm()}
      {formType === 'disqualifying' && renderDisqualifyingConditionsForm()}
      {formType === 'temporary' && renderTemporaryConditionsForm()}
    </div>
  );
};

export default DonorQuestionnaire;