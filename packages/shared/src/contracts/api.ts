export type Health = { status: 'ok' | 'down'; service: string };

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type Property = {
  id: string;
  title: string;
  city: string;
  pricePerNight: string;
  imageUrl: string | null;
};

export type Booking = {
  id: string;
  propertyId: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  status: string;
};

export type Payment = {
  id: string;
  bookingId: string;
  amount: string;
  currency: string;
  status: string;
};
