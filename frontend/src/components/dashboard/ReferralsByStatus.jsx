import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CheckCircle, Loader, AlertTriangle, Clock, Users } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import ReferralsTable from '../shared/ReferralsTable';

const ReferralsByStatus = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/referrals/by-status/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setData(response.data);
        
        // קבע את הסטטוס הראשון כברירת מחדל
        if (response.data) {
          const firstStatus = Object.keys(response.data)[0];
          setActiveStatus(firstStatus);
        }
      } catch (err) {
        console.error('Error fetching referrals by status:', err);
        setError('אירעה שגיאה בטעינת נתוני ההפניות לפי סטטוס');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="h-12 w-12 animate-spin text-primary" />
        <span className="mr-4 text-lg">טוען נתונים...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 text-destructive">
        <AlertTriangle className="h-12 w-12 mr-4" />
        <span>{error}</span>
      </div>
    );
  }

  if (!data) return null;

  // רשימת הסטטוסים
  const statuses = Object.keys(data);

  // הגדרות סטטוסים
  const statusConfig = {
    'appointment_scheduled': {
      icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      display: 'נקבע תור'
    },
    'requires_coordination': {
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      display: 'דרוש תיאום'
    },
    'requires_soldier_coordination': {
      icon: <Users className="h-5 w-5 text-amber-500" />,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      display: 'תיאום עם חייל'
    },
    'waiting_for_medical_date': {
      icon: <Clock className="h-5 w-5 text-purple-500" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      display: 'ממתין לתאריך'
    },
    'waiting_for_budget_approval': {
      icon: <Clock className="h-5 w-5 text-purple-500" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      display: 'ממתין לאישור'
    },
    'waiting_for_doctor_referral': {
      icon: <Clock className="h-5 w-5 text-purple-500" />,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      display: 'ממתין להפניה'
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-right">הפניות לפי סטטוס</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statuses.map(status => {
          const statusData = data[status];
          const config = statusConfig[status] || {
            icon: <CheckCircle className="h-5 w-5 text-gray-500" />,
            color: 'bg-gray-50 text-gray-700 border-gray-200',
            display: statusData.display || status
          };
          
          return (
            <Card 
              key={status} 
              className={`hover:shadow-md transition-shadow cursor-pointer border ${config.color}`}
              onClick={() => setActiveStatus(status)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{config.display}</p>
                    <p className="text-2xl font-bold mt-1">{statusData.total}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 ml-1" />
                        {statusData.urgent} דחופים
                      </span>
                      <span className="text-xs inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        <Users className="h-3 w-3 ml-1" />
                        {Object.keys(statusData.by_team || {}).length} צוותים
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-white shadow-sm">
                    {config.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeStatus && data[activeStatus] && (
        <div>
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">הפניות ב{data[activeStatus].display || activeStatus} לפי צוות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(data[activeStatus].by_team || {}).map(([team, teamData]) => (
                  <div key={team} className="border p-4 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium">צוות {team}</h3>
                    <p className="text-2xl font-bold mt-1">{teamData.count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <ReferralsTable 
            initialReferrals={data[activeStatus].referrals} 
            title={`הפניות - ${data[activeStatus].display || activeStatus}`}
            showFilters={true}
          />
        </div>
      )}
    </div>
  );
};

export default ReferralsByStatus;