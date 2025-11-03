# Business Development Analytics Dashboard - Sample Python Code

## Overview
This document contains sample Python code snippets that would be part of the Business Development Analytics Dashboard project. These examples demonstrate key functionalities including data processing, ETL pipelines, and analytics calculations.

---

## 1. ETL Pipeline - Data Extraction & Transformation

### 1.1 Main ETL Script

```python
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import psycopg2
from sqlalchemy import create_engine, text
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='etl_pipeline.log'
)
logger = logging.getLogger(__name__)

class ETLPipeline:
    """ETL Pipeline for Business Development Analytics Dashboard"""
    
    def __init__(self, db_url):
        self.engine = create_engine(db_url)
        logger.info("Database connection established")
    
    def extract_sales_data(self, source_file):
        """Extract sales data from CSV or Excel"""
        try:
            if source_file.endswith('.csv'):
                df = pd.read_csv(source_file)
            else:
                df = pd.read_excel(source_file)
            logger.info(f"Extracted {len(df)} sales records")
            return df
        except Exception as e:
            logger.error(f"Error extracting sales data: {e}")
            raise
    
    def extract_crm_data(self, api_endpoint, api_key):
        """Extract client interaction data from CRM API"""
        import requests
        try:
            headers = {'Authorization': f'Bearer {api_key}'}
            response = requests.get(api_endpoint, headers=headers)
            data = response.json()
            df = pd.DataFrame(data['records'])
            logger.info(f"Extracted {len(df)} CRM records")
            return df
        except Exception as e:
            logger.error(f"Error extracting CRM data: {e}")
            raise
    
    def transform_sales_data(self, df):
        """Transform and clean sales data"""
        try:
            # Convert date column to datetime
            df['date'] = pd.to_datetime(df['date'])
            
            # Remove duplicates
            df = df.drop_duplicates(subset=['transaction_id'])
            
            # Calculate derived metrics
            df['month'] = df['date'].dt.to_period('M')
            df['quarter'] = df['date'].dt.to_period('Q')
            df['year'] = df['date'].dt.year
            
            # Remove negative amounts (invalid transactions)
            df = df[df['amount'] > 0]
            
            # Fill missing values
            df['customer_segment'] = df['customer_segment'].fillna('Unknown')
            df['sales_rep'] = df['sales_rep'].fillna('Unassigned')
            
            logger.info(f"Transformed {len(df)} sales records")
            return df
        except Exception as e:
            logger.error(f"Error transforming sales data: {e}")
            raise
    
    def calculate_kpis(self, sales_df, crm_df):
        """Calculate key performance indicators"""
        try:
            kpis = {}
            
            # Monthly revenue calculation
            kpis['monthly_revenue'] = sales_df.groupby('month')['amount'].sum()
            
            # Win rate calculation
            total_interactions = len(crm_df)
            won_interactions = len(crm_df[crm_df['outcome'] == 'Won'])
            kpis['win_rate'] = (won_interactions / total_interactions * 100) if total_interactions > 0 else 0
            
            # Average deal size
            kpis['avg_deal_size'] = sales_df['amount'].mean()
            
            # Sales by representative
            kpis['sales_by_rep'] = sales_df.groupby('sales_rep')['amount'].sum()
            
            logger.info("KPI calculations completed")
            return kpis
        except Exception as e:
            logger.error(f"Error calculating KPIs: {e}")
            raise
    
    def load_to_database(self, df, table_name):
        """Load transformed data to PostgreSQL database"""
        try:
            df.to_sql(table_name, self.engine, if_exists='append', index=False)
            logger.info(f"Loaded {len(df)} records to {table_name} table")
        except Exception as e:
            logger.error(f"Error loading data to database: {e}")
            raise
    
    def run_pipeline(self, sales_file, crm_endpoint, api_key):
        """Execute full ETL pipeline"""
        logger.info("Starting ETL Pipeline")
        
        # Extract
        sales_df = self.extract_sales_data(sales_file)
        crm_df = self.extract_crm_data(crm_endpoint, api_key)
        
        # Transform
        sales_df = self.transform_sales_data(sales_df)
        
        # Calculate KPIs
        kpis = self.calculate_kpis(sales_df, crm_df)
        
        # Load
        self.load_to_database(sales_df, 'sales_transactions')
        self.load_to_database(crm_df, 'client_interactions')
        
        logger.info("ETL Pipeline completed successfully")
        return kpis

# Usage
if __name__ == "__main__":
    pipeline = ETLPipeline('postgresql://user:password@localhost/analytics_db')
    kpis = pipeline.run_pipeline(
        sales_file='sales_data.csv',
        crm_endpoint='https://api.crm.com/v1/interactions',
        api_key='your_api_key_here'
    )
```

---

## 2. KPI Analytics & Calculations

### 2.1 Team Performance Analysis

```python
import pandas as pd
from sqlalchemy import create_engine

class TeamAnalytics:
    """Team Performance Analytics"""
    
    def __init__(self, db_url):
        self.engine = create_engine(db_url)
    
    def calculate_team_performance(self, start_date, end_date):
        """Calculate team performance against targets"""
        
        query = f"""
        SELECT 
            team_name,
            COUNT(DISTINCT employee_id) as team_size,
            SUM(sales_amount) as total_sales,
            COUNT(DISTINCT transaction_id) as transaction_count,
            AVG(transaction_amount) as avg_transaction,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
            COUNT(*) as total_tasks,
            ROUND(100.0 * SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) 
                  / COUNT(*), 2) as task_completion_rate
        FROM team_performance
        WHERE date >= '{start_date}' AND date <= '{end_date}'
        GROUP BY team_name
        ORDER BY total_sales DESC
        """
        
        df = pd.read_sql(query, self.engine)
        
        # Calculate performance vs target
        targets = {
            'Sales Team': 65000,
            'Dev Team': 45000,
            'Support': 50000,
            'Business Dev': 55000
        }
        
        df['target'] = df['team_name'].map(targets)
        df['performance_vs_target'] = (df['total_sales'] / df['target'] * 100).round(2)
        df['status'] = df['performance_vs_target'].apply(
            lambda x: 'On Track' if x >= 90 else 'At Risk' if x >= 75 else 'Critical'
        )
        
        return df
    
    def get_individual_performance(self, employee_id, period='month'):
        """Get individual employee performance"""
        
        query = f"""
        SELECT 
            employee_id,
            employee_name,
            team_name,
            SUM(sales_amount) as total_sales,
            COUNT(DISTINCT transaction_id) as deals_closed,
            AVG(transaction_amount) as avg_deal_size,
            COUNT(DISTINCT client_id) as unique_clients,
            ROUND(100.0 * SUM(CASE WHEN status = 'Won' THEN 1 ELSE 0 END)
                  / COUNT(*), 2) as win_rate
        FROM employee_performance
        WHERE employee_id = {employee_id}
        GROUP BY employee_id, employee_name, team_name
        """
        
        df = pd.read_sql(query, self.engine)
        return df
    
    def team_comparison(self):
        """Compare all teams performance"""
        
        query = """
        SELECT 
            team_name,
            SUM(sales_amount) as total_revenue,
            AVG(transaction_amount) as avg_deal_size,
            COUNT(DISTINCT employee_id) as team_members,
            SUM(sales_amount) / COUNT(DISTINCT employee_id) as revenue_per_person,
            ROUND(100.0 * SUM(CASE WHEN status = 'Won' THEN 1 ELSE 0 END)
                  / COUNT(*), 2) as overall_win_rate
        FROM team_performance
        WHERE MONTH(date) = MONTH(GETDATE())
        GROUP BY team_name
        ORDER BY total_revenue DESC
        """
        
        return pd.read_sql(query, self.engine)

# Usage
analytics = TeamAnalytics('postgresql://user:password@localhost/analytics_db')
team_perf = analytics.calculate_team_performance('2024-01-01', '2024-12-31')
print(team_perf)
```

### 2.2 Client Negotiation Analysis

```python
class ClientNegotiationAnalytics:
    """Client Negotiation & Win Rate Analysis"""
    
    def __init__(self, db_url):
        self.engine = create_engine(db_url)
    
    def win_rate_analysis(self, lookback_months=12):
        """Analyze negotiation win rates"""
        
        query = f"""
        SELECT 
            MONTH(date) as month,
            COUNT(*) as total_negotiations,
            SUM(CASE WHEN outcome = 'Won' THEN 1 ELSE 0 END) as wins,
            SUM(CASE WHEN outcome = 'Lost' THEN 1 ELSE 0 END) as losses,
            SUM(CASE WHEN outcome = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
            ROUND(100.0 * SUM(CASE WHEN outcome = 'Won' THEN 1 ELSE 0 END) 
                  / COUNT(*), 2) as win_rate,
            ROUND(AVG(DATEDIFF(day, start_date, end_date)), 0) as avg_duration_days
        FROM client_interactions
        WHERE date >= DATEADD(month, -{lookback_months}, GETDATE())
        GROUP BY MONTH(date)
        ORDER BY month
        """
        
        df = pd.read_sql(query, self.engine)
        return df
    
    def client_segment_analysis(self):
        """Analyze win rate by client segment"""
        
        query = """
        SELECT 
            client_segment,
            COUNT(*) as total_interactions,
            SUM(CASE WHEN outcome = 'Won' THEN 1 ELSE 0 END) as wins,
            ROUND(100.0 * SUM(CASE WHEN outcome = 'Won' THEN 1 ELSE 0 END) 
                  / COUNT(*), 2) as win_rate,
            ROUND(AVG(deal_value), 2) as avg_deal_value,
            SUM(deal_value) as total_value
        FROM client_interactions
        GROUP BY client_segment
        ORDER BY win_rate DESC
        """
        
        return pd.read_sql(query, self.engine)
    
    def negotiator_performance(self):
        """Identify top performing negotiators"""
        
        query = """
        SELECT TOP 10
            negotiator_name,
            COUNT(*) as negotiations_handled,
            SUM(CASE WHEN outcome = 'Won' THEN 1 ELSE 0 END) as wins,
            ROUND(100.0 * SUM(CASE WHEN outcome = 'Won' THEN 1 ELSE 0 END) 
                  / COUNT(*), 2) as win_rate,
            ROUND(AVG(deal_value), 2) as avg_deal_value,
            SUM(deal_value) as total_value_won
        FROM client_interactions
        WHERE outcome = 'Won'
        GROUP BY negotiator_name
        ORDER BY win_rate DESC, total_value_won DESC
        """
        
        return pd.read_sql(query, self.engine)

# Usage
negotiation_analytics = ClientNegotiationAnalytics('postgresql://user:password@localhost/analytics_db')
win_rates = negotiation_analytics.win_rate_analysis()
segment_analysis = negotiation_analytics.client_segment_analysis()
```

---

## 3. Financial Analytics

### 3.1 Budget & Financial Tracking

```python
class FinancialAnalytics:
    """Financial Dashboard & Budget Tracking"""
    
    def __init__(self, db_url):
        self.engine = create_engine(db_url)
    
    def budget_utilization(self):
        """Calculate budget utilization rate"""
        
        query = """
        SELECT 
            department,
            SUM(allocated_budget) as total_allocated,
            SUM(actual_spend) as total_spent,
            SUM(allocated_budget) - SUM(actual_spend) as remaining_budget,
            ROUND(100.0 * SUM(actual_spend) / SUM(allocated_budget), 2) as utilization_rate,
            ROUND(100.0 * (SUM(allocated_budget) - SUM(actual_spend)) 
                  / SUM(allocated_budget), 2) as remaining_percentage
        FROM budget_tracking
        WHERE year = YEAR(GETDATE())
        GROUP BY department
        """
        
        return pd.read_sql(query, self.engine)
    
    def monthly_revenue_forecast(self, months_ahead=6):
        """Forecast revenue based on trends"""
        from sklearn.linear_model import LinearRegression
        
        # Get historical data
        query = """
        SELECT 
            YEAR(date) as year,
            MONTH(date) as month,
            SUM(amount) as revenue
        FROM sales_transactions
        WHERE date >= DATEADD(year, -2, GETDATE())
        GROUP BY YEAR(date), MONTH(date)
        ORDER BY year, month
        """
        
        historical = pd.read_sql(query, self.engine)
        historical['date_numeric'] = range(len(historical))
        
        # Train simple linear regression model
        X = historical[['date_numeric']].values
        y = historical['revenue'].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Forecast
        future_months = np.arange(len(historical), len(historical) + months_ahead).reshape(-1, 1)
        forecast = model.predict(future_months)
        
        return forecast
    
    def profit_margin_analysis(self):
        """Analyze profit margins by product/service"""
        
        query = """
        SELECT 
            product_category,
            SUM(revenue) as total_revenue,
            SUM(cost) as total_cost,
            SUM(revenue) - SUM(cost) as total_profit,
            ROUND(100.0 * (SUM(revenue) - SUM(cost)) / SUM(revenue), 2) as profit_margin_percent,
            COUNT(DISTINCT customer_id) as customer_count,
            ROUND(SUM(revenue) / COUNT(DISTINCT customer_id), 2) as revenue_per_customer
        FROM sales_analysis
        GROUP BY product_category
        ORDER BY profit_margin_percent DESC
        """
        
        return pd.read_sql(query, self.engine)
    
    def tax_calculation(self, revenue, expense_ratio=0.25):
        """Calculate tax impact"""
        gross_profit = revenue * (1 - expense_ratio)
        tax_rate = 0.30  # Example 30% tax rate
        taxes = gross_profit * tax_rate
        net_profit = gross_profit - taxes
        
        return {
            'gross_revenue': revenue,
            'expenses': revenue * expense_ratio,
            'gross_profit': gross_profit,
            'taxes': taxes,
            'net_profit': net_profit,
            'net_margin': (net_profit / revenue * 100)
        }

# Usage
financial = FinancialAnalytics('postgresql://user:password@localhost/analytics_db')
budget = financial.budget_utilization()
tax_info = financial.tax_calculation(revenue=75000)
```

---

## 4. Data Visualization Functions

### 4.1 Creating Interactive Dashboards

```python
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots

class DashboardVisualizations:
    """Create interactive dashboard visualizations"""
    
    @staticmethod
    def monthly_sales_trend(sales_data):
        """Create monthly sales trend line chart"""
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=sales_data['month'].astype(str),
            y=sales_data['revenue'],
            mode='lines+markers',
            name='Monthly Revenue',
            line=dict(color='#1f77b4', width=3),
            marker=dict(size=8)
        ))
        
        fig.update_layout(
            title='Monthly Sales Trend (12-Month)',
            xaxis_title='Month',
            yaxis_title='Revenue (USD)',
            hovermode='x unified',
            template='plotly_white'
        )
        
        return fig
    
    @staticmethod
    def win_rate_pie_chart():
        """Create client win rate pie chart"""
        labels = ['Won', 'In Progress', 'Lost']
        values = [65, 25, 10]
        colors = ['#06d6a0', '#ffd60a', '#ef476f']
        
        fig = go.Figure(data=[go.Pie(
            labels=labels,
            values=values,
            marker=dict(colors=colors)
        )])
        
        fig.update_layout(
            title='Client Negotiation Outcomes',
            template='plotly_white'
        )
        
        return fig
    
    @staticmethod
    def team_performance_bar(team_data):
        """Create team performance bar chart"""
        fig = go.Figure()
        
        fig.add_trace(go.Bar(
            x=team_data['team_name'],
            y=team_data['performance'],
            name='Performance (%)',
            marker_color='#1f77b4'
        ))
        
        fig.add_hline(
            y=90,
            line_dash="dash",
            line_color="red",
            annotation_text="Target (90%)"
        )
        
        fig.update_layout(
            title='Team Performance vs Target',
            yaxis_title='Performance (%)',
            template='plotly_white'
        )
        
        return fig
    
    @staticmethod
    def budget_gauge():
        """Create budget utilization gauge"""
        fig = go.Figure(go.Indicator(
            mode="gauge+number+delta",
            value=87,
            title={'text': "Budget Utilization"},
            delta={'reference': 90},
            gauge={
                'axis': {'range': [0, 100]},
                'bar': {'color': "darkblue"},
                'steps': [
                    {'range': [0, 50], 'color': "lightgray"},
                    {'range': [50, 75], 'color': "gray"},
                    {'range': [75, 100], 'color': "lightgreen"}
                ],
                'threshold': {
                    'line': {'color': "red", 'width': 4},
                    'thickness': 0.75,
                    'value': 95
                }
            }
        ))
        
        return fig

# Usage
viz = DashboardVisualizations()
sales_data = pd.DataFrame({
    'month': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    'revenue': [45000, 48500, 52000, 51500, 58000, 62000, 61500, 65000, 68000, 70000, 72000, 75000]
})
fig1 = viz.monthly_sales_trend(sales_data)
fig1.show()
```

---

## 5. Scheduling & Automation

### 5.1 Scheduled Report Generation

```python
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import smtplib
from email.mime.text import MIMEText

class AutomatedReporting:
    """Automated Report Generation & Email Distribution"""
    
    def __init__(self, smtp_server, smtp_port, email_address, password):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.email_address = email_address
        self.password = password
        self.scheduler = BackgroundScheduler()
    
    def generate_daily_report(self):
        """Generate daily KPI report"""
        report = f"""
        DAILY KPI REPORT
        Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        
        Today's Key Metrics:
        - Sales Today: ${45000}
        - New Leads: 12
        - Deals Closed: 3
        - Client Satisfaction: 4.7/5.0
        
        Status: All KPIs on track
        """
        return report
    
    def generate_weekly_report(self):
        """Generate weekly performance report"""
        report = """
        WEEKLY PERFORMANCE REPORT
        
        Team Performance Summary:
        - Sales Team: 92% of target
        - Dev Team: 88% of target
        - Support: 95% of target
        
        Top Performers:
        1. John Doe - $15,000 revenue
        2. Jane Smith - $14,500 revenue
        3. Bob Johnson - $13,200 revenue
        """
        return report
    
    def send_email(self, recipient, subject, body):
        """Send email report"""
        try:
            msg = MIMEText(body)
            msg['Subject'] = subject
            msg['From'] = self.email_address
            msg['To'] = recipient
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_address, self.password)
            server.send_message(msg)
            server.quit()
            
            print(f"Report sent to {recipient}")
        except Exception as e:
            print(f"Error sending email: {e}")
    
    def schedule_daily_report(self, time='09:00', recipient='manager@company.com'):
        """Schedule daily report at specific time"""
        self.scheduler.add_job(
            func=self.send_email,
            args=[recipient, 'Daily KPI Report', self.generate_daily_report()],
            trigger='cron',
            hour=int(time.split(':')[0]),
            minute=int(time.split(':')[1])
        )
        self.scheduler.start()
    
    def schedule_weekly_report(self, day='monday', time='09:00', recipient='manager@company.com'):
        """Schedule weekly report"""
        self.scheduler.add_job(
            func=self.send_email,
            args=[recipient, 'Weekly Performance Report', self.generate_weekly_report()],
            trigger='cron',
            day_of_week=day,
            hour=int(time.split(':')[0]),
            minute=int(time.split(':')[1])
        )
        self.scheduler.start()

# Usage
reporting = AutomatedReporting(
    smtp_server='smtp.gmail.com',
    smtp_port=587,
    email_address='your_email@gmail.com',
    password='your_app_password'
)
reporting.schedule_daily_report(time='09:00', recipient='team@company.com')
reporting.schedule_weekly_report(day='monday', recipient='manager@company.com')
```

---

## Installation & Dependencies

### Required Python Libraries

```
pandas>=1.3.0
numpy>=1.20.0
psycopg2-binary>=2.9.0
sqlalchemy>=1.4.0
plotly>=5.0.0
scikit-learn>=0.24.0
apscheduler>=3.8.0
requests>=2.26.0
python-dotenv>=0.19.0
```

### Install Requirements

```bash
pip install -r requirements.txt
```

---

## Configuration

Create a `.env` file with your database and API credentials:

```
DATABASE_URL=postgresql://user:password@localhost:5432/analytics_db
CRM_API_ENDPOINT=https://api.crm.com/v1
CRM_API_KEY=your_api_key_here
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_ADDRESS=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

---

## Conclusion

This codebase provides the foundation for the Business Development Analytics Dashboard. The modular design allows for easy extension and customization based on specific business requirements.

For production deployment, ensure proper error handling, logging, and security measures are implemented.