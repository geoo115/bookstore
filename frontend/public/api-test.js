// Simple test script to verify API connectivity
async function testLogin() {
    try {
        console.log('Testing login API...');
        
        const response = await fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'password'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Login successful!', data);
            return data.token;
        } else {
            console.error('❌ Login failed:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ Network error:', error);
    }
}

async function testBooks(token) {
    try {
        console.log('Testing books API...');
        
        const response = await fetch('http://localhost:8080/books', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const books = await response.json();
            console.log('✅ Books retrieved:', books);
        } else {
            console.error('❌ Books request failed:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ Network error:', error);
    }
}

// Run the test
testLogin().then(token => {
    if (token) {
        testBooks(token);
    }
});
