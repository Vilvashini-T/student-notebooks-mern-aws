const axios = require('axios');

async function test() {
    try {
        const { data: loginData } = await axios.post('http://localhost:5000/api/users/login', {
            email: 'admin@studentnotebooks.com',
            password: '123456'
        });
        const token = loginData.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const productId = '69ad97c538a6f8651deec7d7'; // The product ID we used earlier

        // 1. Try to create a variation with existing SKU 'SN-NB-100P-01'
        console.log('Testing Duplicate SKU...');
        try {
            await axios.post(`http://localhost:5000/api/products/${productId}/variations`, {
                sku: 'SN-NB-100P-01',
                attributes: { type: 'Standard' },
                priceAdjustment: 0,
                stockQuantity: 10
            }, config);
            console.log('FAIL: Did not get error for duplicate SKU');
        } catch (err) {
            console.log('SUCCESS: Got expected error ->', err.response?.status, err.response?.data?.message);
        }

        // 2. Create a new valid variation
        console.log('\nTesting Create Variation...');
        let newVariationId;
        try {
            const { data } = await axios.post(`http://localhost:5000/api/products/${productId}/variations`, {
                sku: `TEST-SKU-${Date.now()}`,
                attributes: { type: 'Test' },
                priceAdjustment: 5,
                stockQuantity: 20
            }, config);
            newVariationId = data._id;
            console.log('SUCCESS: Generated variation ID ->', newVariationId);
        } catch (err) {
            console.log('FAIL: Could not create variation:', err.response?.data?.message || err.message);
        }

        if (newVariationId) {
            // 3. Delete the variation
            console.log('\nTesting Delete Variation...');
            try {
                const { data } = await axios.delete(`http://localhost:5000/api/products/${productId}/variations/${newVariationId}`, config);
                console.log('SUCCESS: Deleted variation ->', data.message);
            } catch (err) {
                console.log('FAIL: Could not delete variation:', err.response?.data?.message || err.message);
            }
        }
    } catch (e) {
        console.error('Fatal error', e.message);
    }
}
test();
