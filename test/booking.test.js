import { expect } from 'chai';

const BASE_URL = 'https://restful-booker.herokuapp.com';

describe('Restful-Booker API Test Suite', function () {
    // Increased timeout - public API can be slow
    this.timeout(10000);

    let token = '';
    let bookingId = null;

    const bookingPayload = {
        firstname: 'Jim',
        lastname: 'Brown',
        totalprice: 111,
        depositpaid: true,
        bookingdates: {
            checkin: '2026-01-01',
            checkout: '2026-01-10'
        },
        additionalneeds: 'Breakfast'
    };

    const updatedPayload = {
        firstname: 'James',
        lastname: 'Brown',
        totalprice: 150,
        depositpaid: false,
        bookingdates: {
            checkin: '2026-01-01',
            checkout: '2026-01-12'
        },
        additionalneeds: 'Late Checkout'
    };

    it('Scenario 1: Should create a token and reuse it in later requests', async function () {
        const authResponse = await fetch(`${BASE_URL}/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'password123'
            })
        });

        expect(authResponse.status).to.equal(200);
        expect(authResponse.headers.get('content-type')).to.include('application/json');

        const authBody = await authResponse.json();
        expect(authBody).to.have.property('token').that.is.a('string');

        token = authBody.token;
    });

    it('Scenario 2: Should create a new booking', async function () {
        const createResponse = await fetch(`${BASE_URL}/booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(bookingPayload)
        });

        expect(createResponse.status).to.equal(200);
        expect(createResponse.headers.get('content-type')).to.include('application/json');

        const createBody = await createResponse.json();
        expect(createBody).to.have.property('bookingid').that.is.a('number');
        expect(createBody.booking.firstname).to.equal(bookingPayload.firstname);

        bookingId = createBody.bookingid;
    });

    it('Scenario 3: Should retrieve the created booking by ID', async function () {
        expect(bookingId, 'Booking ID is required').to.not.be.null;

        const getResponse = await fetch(`${BASE_URL}/booking/${bookingId}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        expect(getResponse.status).to.equal(200);
        expect(getResponse.headers.get('content-type')).to.include('application/json');

        const getBody = await getResponse.json();
        expect(getBody.firstname).to.equal(bookingPayload.firstname);
        expect(getBody.additionalneeds).to.equal(bookingPayload.additionalneeds);
    });

    it('Scenario 4: Should update the booking', async function () {
        expect(bookingId, 'Booking ID is required').to.not.be.null;

        const updateResponse = await fetch(`${BASE_URL}/booking/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cookie': `token=${token}`
            },
            body: JSON.stringify(updatedPayload)
        });

        expect(updateResponse.status).to.equal(200);
        expect(updateResponse.headers.get('content-type')).to.include('application/json');

        const updateBody = await updateResponse.json();
        expect(updateBody.firstname).to.equal(updatedPayload.firstname);
        expect(updateBody.totalprice).to.equal(updatedPayload.totalprice);
    });

    it('Scenario 5: Should reject update without a valid auth token', async function () {
        expect(bookingId, 'Booking ID is required').to.not.be.null;

        const unauthorizedResponse = await fetch(`${BASE_URL}/booking/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
                // Intentionally no Cookie/token header
            },
            body: JSON.stringify(updatedPayload)
        });

        expect(unauthorizedResponse.status).to.equal(403);
    });

    it('Scenario 6: Should remove the booking', async function () {
        expect(bookingId, 'Booking ID is required').to.not.be.null;

        const deleteResponse = await fetch(`${BASE_URL}/booking/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Cookie': `token=${token}`
            }
        });

        // Note: restful-booker returns 201 + "Created" text for DELETE requests,
        // which is unconventional (typically DELETE returns 200 or 204),
        // but this is documented/actual behavior of this specific API.
        expect(deleteResponse.status).to.equal(201);
        expect(deleteResponse.headers.get('content-type')).to.include('text/plain');
        const deleteBodyText = await deleteResponse.text();
        expect(deleteBodyText).to.equal('Created');
    });

});