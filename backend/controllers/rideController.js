import RideBuddy from '../models/RideBuddy.js';

// Create Ride
export const createRide = async (req, res) => {
  try {
    const { vehicleType, fromLocation, toLocation, rideDate, rideTime, description, contactInfo } = req.body;

    // Validate vehicle type and set max capacity
    let maxCapacity = 1;
    if (vehicleType === 'car') {
      maxCapacity = req.body.maxCapacity || 5;
      if (maxCapacity > 5) maxCapacity = 5;
      if (maxCapacity < 1) maxCapacity = 1;
    } else if (vehicleType === 'bike') {
      maxCapacity = 1;
    } else {
      return res.status(400).json({ message: 'Invalid vehicle type. Must be "bike" or "car"' });
    }

    const ride = new RideBuddy({
      user: req.userId,
      vehicleType,
      maxCapacity,
      fromLocation,
      toLocation,
      rideDate,
      rideTime,
      description: description || '',
      contactInfo: contactInfo || '',
      status: 'open'
    });

    await ride.save();
    await ride.populate('user', 'name email phone');

    res.status(201).json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Rides
export const getRides = async (req, res) => {
  try {
    const { fromLocation, toLocation, vehicleType, status } = req.query;
    let query = {};

    // Filter by location
    if (fromLocation) {
      query.fromLocation = { $regex: fromLocation, $options: 'i' };
    }
    if (toLocation) {
      query.toLocation = { $regex: toLocation, $options: 'i' };
    }
    if (vehicleType) {
      query.vehicleType = vehicleType;
    }
    if (status) {
      query.status = status;
    }

    const rides = await RideBuddy.find(query)
      .populate('user', 'name email phone')
      .populate('pairRequests.user', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    // Add accepted count and isFull status to each ride
    const ridesWithStatus = rides.map(ride => {
      const acceptedCount = ride.pairRequests.filter(req => req.status === 'accepted').length;
      const isFull = acceptedCount >= ride.maxCapacity;
      return {
        ...ride,
        acceptedCount,
        isFull,
        availableSpots: ride.maxCapacity - acceptedCount
      };
    });

    res.json(ridesWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send Pair Request
export const sendPairRequest = async (req, res) => {
  try {
    const ride = await RideBuddy.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if ride is full or cancelled
    if (ride.status === 'full' || ride.status === 'cancelled' || ride.status === 'completed') {
      return res.status(400).json({ message: 'This ride is no longer accepting requests' });
    }

    // Check if ride is actually full
    const acceptedCount = ride.pairRequests.filter(req => req.status === 'accepted').length;
    if (acceptedCount >= ride.maxCapacity) {
      ride.status = 'full';
      await ride.save();
      return res.status(400).json({ message: 'This ride is full' });
    }

    // Check if user is the ride owner
    if (ride.user.toString() === req.userId) {
      return res.status(400).json({ message: 'You cannot request your own ride' });
    }

    // Check if already requested
    const alreadyRequested = ride.pairRequests.some(
      request => request.user.toString() === req.userId
    );

    if (alreadyRequested) {
      return res.status(400).json({ message: 'Already sent a pair request' });
    }

    ride.pairRequests.push({
      user: req.userId,
      status: 'pending'
    });

    await ride.save();
    await ride.populate('user', 'name email phone');
    await ride.populate('pairRequests.user', 'name email phone');

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept/Reject Pair Request
export const updatePairRequest = async (req, res) => {
  try {
    const { requestUserId, status } = req.body; // status: 'accepted' or 'rejected'

    const ride = await RideBuddy.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Check if user is the ride owner
    if (ride.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find and update the request
    const request = ride.pairRequests.find(
      req => req.user.toString() === requestUserId
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // If accepting, check if ride is full
    if (status === 'accepted') {
      const acceptedCount = ride.pairRequests.filter(req => req.status === 'accepted').length;
      if (acceptedCount >= ride.maxCapacity) {
        return res.status(400).json({ message: 'Ride is already full' });
      }
    }

    request.status = status;

    // Update ride status if needed
    if (status === 'accepted') {
      const newAcceptedCount = ride.pairRequests.filter(req => req.status === 'accepted').length;
      if (newAcceptedCount >= ride.maxCapacity) {
        ride.status = 'full';
      } else if (ride.status === 'full') {
        ride.status = 'open';
      }
    }

    await ride.save();
    await ride.populate('user', 'name email phone');
    await ride.populate('pairRequests.user', 'name email phone');

    res.json(ride);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};