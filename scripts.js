

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('transactionForm')
    


    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const expenseName = document.getElementById('ename').value;
        const expenseAmount = document.getElementById('eamount').value;
        const expenseDate = document.getElementById('edate').value;
        const submision=document.getElementById('status');

        try{
            const response = await fetch('http://localhost:5000/api/add-expense', {
                method: 'POST',
                headers:  {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ expenseName, expenseAmount, expenseDate })
            });

            const data = response.data;

            if(!response.ok) {
                
                submision.textContent = "Expense already exist!"
                submision.style.color="green";
            } else {
                submision.textContent = "Expense created successfully"
            }

        } catch (err) {
            submision.textContent = 'An error occured'
        }

        
    });

    try {
        const response = fetch('http://localhost:5000/api/sum-expenses')
        .then(response => response.json())
        .then(data => {
            const expense = document.getElementById('expense');
            expense.textContent = data[0]['SUM(expenseAmount)'];
        })
    } catch (error) {
        throw error;
    }
});

try {
    const response = fetch('http://localhost:5000/expenses')
    .then(response => response.json())
    .then(data => {
        const expenseTable = document.getElementById('expenseTable');
        console.log(expenseTable);
        data.forEach(expense => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 5px">${expense.expenseName}</td>
                <td style="padding: 5px">${expense.expenseAmount}</td>
                <td style="padding: 5px">${expense.expenseDate}</td>
            `;
            expenseTable.appendChild(tr);
        });
    });
} catch (error) {
    throw error;
}