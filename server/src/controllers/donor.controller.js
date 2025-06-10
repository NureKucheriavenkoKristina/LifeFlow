const DonorProfile = require('../models/donorProfile.model');
const MedicalInfo = require('../models/medicalInfo.model');
const DonationRecord = require('../models/donationRecord.model');
const SearchRequest = require('../models/searchRequest.model');
const { createMeeting } = require('../services/zoomService');

// Get donor profile
exports.getDonorProfile = async (req, res) => {
    try {
        const donorProfile = await DonorProfile.findOne({userId: req.user.id});

        if (!donorProfile) {
            return res.status(404).json({message: 'Donor profile not found'});
        }

        // Get medical info
        const medicalInfo = await MedicalInfo.findOne({donorId: donorProfile._id});

        res.status(200).json({
            donorProfile,
            medicalInfo
        });
    } catch (error) {
        console.error('Get donor profile error:', error);
        res.status(500).json({message: 'Server error'});
    }
};

// Update donor profile
exports.updateDonorProfile = async (req, res) => {
    try {
        const donorProfile = await DonorProfile.findOne({userId: req.user.id});

        if (!donorProfile) {
            return res.status(404).json({message: 'Donor profile not found'});
        }

        // Update allowed fields
        const allowedFields = [
            'gender', 'birthDay', 'weight', 'bloodType', 'bloodResus',
            'consentToDataProcessing', 'allowProfileVisibility'
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                donorProfile[field] = req.body[field];
            }
        }

        // Save changes
        await donorProfile.save();

        res.status(200).json({
            message: 'Donor profile updated successfully',
            donorProfile
        });
    } catch (error) {
        console.error('Update donor profile error:', error);
        res.status(500).json({message: 'Server error'});
    }
};

// Submit medical questionnaire
exports.submitMedicalQuestionnaire = async (req, res) => {
    try {
        const donorProfile = await DonorProfile.findOne({userId: req.user.id});

        if (!donorProfile) {
            return res.status(404).json({message: 'Donor profile not found'});
        }

        // Check if medical info already exists
        let medicalInfo = await MedicalInfo.findOne({donorId: donorProfile._id});

        if (medicalInfo) {
            // Update existing medical info
            const allowedFields = [
                'HIV_AIDS', 'hepatitisBorC', 'syphilis', 'tuberculosisActiveOrPast',
                'oncologicalDiseases', 'diabetesMellitus', 'heartAndVascularDiseases',
                'centralNervousSystemDiseases', 'autoimmuneDiseases', 'bloodDiseases',
                'hasRecentUpgade', 'upgadeDate', 'acuteRespiratoryInfections',
                'respiratoryInfectionsDate', 'antibioticTherapy', 'antibioticTherapyDate',
                'vaccination', 'vaccinationDate', 'surgeriesInjuriesStitches',
                'surgeriesInjuriesStitchesDate', 'pregnancy', 'pregnancyDate',
                'dentalPocedures', 'dentalPoceduresDate', 'herpesSimplex',
                'herpesSimplexDate', 'donationTypeOffered'
            ];

            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    medicalInfo[field] = req.body[field];
                }
            }
        } else {
            // Create new medical info
            medicalInfo = new MedicalInfo({
                donorId: donorProfile._id,
                ...req.body
            });
        }

        // Check for disqualifying conditions
        const disqualifyingConditions = [
            'HIV_AIDS', 'hepatitisBorC', 'syphilis', 'tuberculosisActiveOrPast',
            'oncologicalDiseases', 'diabetesMellitus', 'heartAndVascularDiseases',
            'centralNervousSystemDiseases', 'autoimmuneDiseases', 'bloodDiseases'
        ];

        const hasDisqualifyingCondition = disqualifyingConditions.some(
            condition => medicalInfo[condition] === true
        );

        // Update donor availability
        if (hasDisqualifyingCondition) {
            donorProfile.available = false;
            donorProfile.hasChronicDiseases = true;
        }

        // Set verification status to pending
        donorProfile.verificationStatus = 'PENDING';

        // Save changes
        await medicalInfo.save();
        await donorProfile.save();

        res.status(200).json({
            message: 'Medical questionnaire submitted successfully',
            medicalInfo,
            donorProfile
        });
    } catch (error) {
        console.error('Submit medical questionnaire error:', error);
        res.status(500).json({message: 'Server error'});
    }
};

// Get donation history
exports.getDonationHistory = async (req, res) => {
    try {
        const donorProfile = await DonorProfile.findOne({userId: req.user.id});

        if (!donorProfile) {
            return res.status(404).json({message: 'Donor profile not found'});
        }

        // Get donation records
        const donationRecords = await DonationRecord.find({
            donorId: donorProfile._id
        }).sort({date: -1});

        res.status(200).json({
            donationRecords
        });
    } catch (error) {
        console.error('Get donation history error:', error);
        res.status(500).json({message: 'Server error'});
    }
};
// Get next available donation date
exports.getNextDonationDate = async (req, res) => {
    try {
        const donorProfile = await DonorProfile.findOne({ userId: req.user.id });

        if (!donorProfile) {
            return res.status(404).json({ message: 'Donor profile not found' });
        }

        // Get medical info
        const medicalInfo = await MedicalInfo.findOne({ donorId: donorProfile._id });

        if (!medicalInfo) {
            return res.status(404).json({ message: 'Medical info not found' });
        }

        // Get last donation record
        const lastDonation = await DonationRecord.findOne({
            donorId: donorProfile._id
        }).sort({ date: -1 });

        // 1. Збираємо всі дати
        let potentialDates = [];

        if (lastDonation) {
            const lastDonationDate = new Date(lastDonation.date);

            if (lastDonation.donationType === 'WHOLE_BLOOD') {
                lastDonationDate.setDate(lastDonationDate.getDate() + 60);
            } else if (
                lastDonation.donationType === 'PLASMA' ||
                lastDonation.donationType === 'PLATELETS'
            ) {
                lastDonationDate.setDate(lastDonationDate.getDate() + 14);
            }

            potentialDates.push(lastDonationDate);
        }

        // 2. Враховуємо всі обмеження
        const medicalRestrictions = [];

        // Tattoo, piercing, etc. (5 months)
        if (medicalInfo.hasRecentUpgade && medicalInfo.upgadeDate) {
            const restrictionDate = new Date(medicalInfo.upgadeDate);
            restrictionDate.setMonth(restrictionDate.getMonth() + 5);
            medicalRestrictions.push({ type: 'hasRecentUpgade', date: restrictionDate });
            potentialDates.push(restrictionDate);
        }

        // Respiratory infections (1 month)
        if (medicalInfo.acuteRespiratoryInfections && medicalInfo.respiratoryInfectionsDate) {
            const restrictionDate = new Date(medicalInfo.respiratoryInfectionsDate);
            restrictionDate.setMonth(restrictionDate.getMonth() + 1);
            medicalRestrictions.push({ type: 'acuteRespiratoryInfections', date: restrictionDate });
            potentialDates.push(restrictionDate);
        }

        // Antibiotic therapy (2 weeks)
        if (medicalInfo.antibioticTherapy && medicalInfo.antibioticTherapyDate) {
            const restrictionDate = new Date(medicalInfo.antibioticTherapyDate);
            restrictionDate.setDate(restrictionDate.getDate() + 14);
            medicalRestrictions.push({ type: 'antibioticTherapy', date: restrictionDate });
            potentialDates.push(restrictionDate);
        }

        // Vaccination (1 month)
        if (medicalInfo.vaccination && medicalInfo.vaccinationDate) {
            const restrictionDate = new Date(medicalInfo.vaccinationDate);
            restrictionDate.setMonth(restrictionDate.getMonth() + 1);
            medicalRestrictions.push({ type: 'vaccination', date: restrictionDate });
            potentialDates.push(restrictionDate);
        }

        // Surgeries, injuries, stitches (6 months)
        if (medicalInfo.surgeriesInjuriesStitches && medicalInfo.surgeriesInjuriesStitchesDate) {
            const restrictionDate = new Date(medicalInfo.surgeriesInjuriesStitchesDate);
            restrictionDate.setMonth(restrictionDate.getMonth() + 6);
            medicalRestrictions.push({ type: 'surgeriesInjuriesStitches', date: restrictionDate });
            potentialDates.push(restrictionDate);
        }

        // Pregnancy (1 year)
        if (medicalInfo.pregnancy && medicalInfo.pregnancyDate) {
            const restrictionDate = new Date(medicalInfo.pregnancyDate);
            restrictionDate.setFullYear(restrictionDate.getFullYear() + 1);
            medicalRestrictions.push({ type: 'pregnancy', date: restrictionDate });
            potentialDates.push(restrictionDate);
        }

        // Dental procedures (1 month)
        if (medicalInfo.dentalPocedures && medicalInfo.dentalPoceduresDate) {
            const restrictionDate = new Date(medicalInfo.dentalPoceduresDate);
            restrictionDate.setMonth(restrictionDate.getMonth() + 1);
            medicalRestrictions.push({ type: 'dentalPocedures', date: restrictionDate });
            potentialDates.push(restrictionDate);
        }

        // Herpes simplex (2 weeks)
        if (medicalInfo.herpesSimplex && medicalInfo.herpesSimplexDate) {
            const restrictionDate = new Date(medicalInfo.herpesSimplexDate);
            restrictionDate.setDate(restrictionDate.getDate() + 14);
            medicalRestrictions.push({ type: 'herpesSimplex', date: restrictionDate });
            potentialDates.push(restrictionDate);
        }

        // 3. Знаходимо найпізнішу дату
        const nextDonationDate = potentialDates.length > 0
            ? new Date(Math.max(...potentialDates.map(date => date.getTime())))
            : new Date(); // Якщо немає дат — поточна дата (рідко буває)

        res.status(200).json({
            nextDonationDate,
            medicalRestrictions: medicalRestrictions
                .filter(r => r.date > new Date()) // фільтр активних обмежень
                .sort((a, b) => a.date - b.date) // сортування по даті
        });
    } catch (error) {
        console.error('Get next donation date error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Get search requests
exports.getSearchRequests = async (req, res) => {
    try {
        const donorProfile = await DonorProfile.findOne({userId: req.user.id});

        if (!donorProfile) {
            return res.status(404).json({message: 'Donor profile not found'});
        }

        // Get search requests
        const searchRequests = await SearchRequest.find({
            donorId: donorProfile._id
        })
            .populate({
                path: 'seekerId',
                populate: {
                    path: 'userId',
                    select: 'firstName surName email'
                }
            })
            .sort({createdAt: -1});

        res.status(200).json({
            searchRequests
        });
    } catch (error) {
        console.error('Get search requests error:', error);
        res.status(500).json({message: 'Server error'});
    }
};

// Respond to search request
exports.respondToSearchRequest = async (req, res) => {
    try {
        const { requestId, response } = req.body;

        const donorProfile = await DonorProfile.findOne({ userId: req.user.id });

        if (!donorProfile) {
            return res.status(404).json({ message: 'Donor profile not found' });
        }
        const searchRequest = await SearchRequest.findOne({
            _id: requestId,
            donorId: donorProfile._id
        });

        if (!searchRequest) {
            return res.status(404).json({ message: 'Search request not found' });
        }

        if (response === 'accept') {
            searchRequest.status = 'ACCEPTED';

            const topic = 'Blood Donation Meeting';
            const startTime = new Date(new Date().getTime() + 5 * 60000).toISOString(); // Початок через 5 хвилин
            const duration = 60;

            const meetingLink = await createMeeting(topic, startTime, duration);

            searchRequest.meetingLink = meetingLink;

        } else if (response === 'reject') {
            searchRequest.status = 'REJECTED';
        } else {
            return res.status(400).json({ message: 'Invalid response' });
        }

        await searchRequest.save();

        res.status(200).json({
            message: `Search request ${response === 'accept' ? 'accepted' : 'rejected'}`,
            searchRequest
        });
    } catch (error) {
        console.error('Respond to search request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};