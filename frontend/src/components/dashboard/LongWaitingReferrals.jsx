import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Clock, Loader, AlertTriangle, Users, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import ReferralsTable from '../shared/ReferralsTable';

const LongWaitingReferrals = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/referrals/long-waiting/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setData(response.data);
      } catch (err) {
        console.error('Error fetching long waiting referrals:', err);
        setError('אירעה שגיאה בטעינת נתוני ההפניות עם המתנה ארוכה');
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

  // כרטיסי נתונים
  const statsCards = [
    {
      title: 'המתנה ארוכה',
      value: data.total,
      icon: <Clock className="h-5 w-5 text-red-500" />,
      description: 'מעל 20 יום ללא תור',
      color: 'bg-red-50 text-red-700 border-red-200'
    },
    {
      title: 'צוותים',
      value: Object.keys(data.by_team || {}).length,
      icon: <Users className="h-5 w-5 text-blue-500" />,
      description: 'עם הפניות בהמתנה',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      title: 'סטטוסים',
      value: Object.keys(data.by_status || {}).length,
      icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
      description: 'סוגי סטטוסים בהמתנה',
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      title: 'הפניות דחופות',
      value: data.by_priority['highest'] || 0,
      icon: <AlertTriangle className="h-5 w-5 text-purple-500" />,
      description: 'בדחיפות הגבוהה ביותר',
      color: 'bg-purple-50 text-purple-700 border-purple-200'
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-right">הפניות בהמתנה ארוכה</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <Card key={index} className={`hover:shadow-md transition-shadow border ${card.color}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{card.title}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </div>
                <div className="p-3 rounded-full bg-white shadow-sm">
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* לפי זמן המתנה */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">לפי זמן המתנה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.by_waiting_time || {}).map(([timeRange, waitingData]) => (
                <div key={timeRange} className="border p-4 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-md font-medium flex items-center">
                        <Clock className="h-4 w-4 ml-1 text-amber-500" />
                        {timeRange} ימים
                      </h3>
                      <p className="text-xl font-bold mt-1">{waitingData.count} הפניות</p>
                    </div>
                    <div className="p-2 bg-amber-50 text-amber-700 rounded-full">
                      {waitingData.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* לפי צוות */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">לפי צוות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.by_team || {}).sort((a, b) => b[1] - a[1]).map(([team, count]) => (
                <div key={team} className="flex items-center">
                  <div className="w-20 text-sm font-medium">{team}</div>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(count / data.total) * 100}%` }}
                    />
                  </div>
                  <div className="w-10 text-right text-sm font-medium">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* לפי סטטוס */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">לפי סטטוס</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.by_status || {}).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
                // תרגום סטטוסים לעברית
                const statusNameMap = {
                  'appointment_scheduled': 'נקבע תור',
                  'requires_coordination': 'דרוש תיאום',
                  'requires_soldier_coordination': 'תיאום עם חייל',
                  'waiting_for_medical_date': 'ממתין לתאריך',
                  'waiting_for_budget_approval': 'ממתין לאישור',
                  'waiting_for_doctor_referral': 'ממתין להפניה'
                };

                return (
                  <div key={status} className="flex items-center">
                    <div className="w-28 text-sm font-medium">{statusNameMap[status] || status}</div>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(count / data.total) * 100}%` }}
                      />
                    </div>
                    <div className="w-10 text-right text-sm font-medium">{count}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* לפי דחיפות */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">לפי דחיפות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(data.by_priority || {}).sort((a, b) => b[1] - a[1]).map(([priority, count]) => {
                // תרגום עדיפויות לעברית
                const priorityNameMap = {
                  'highest': 'דחוף ביותר',
                  'urgent': 'דחוף',
                  'high': 'גבוה',
                  'medium': 'בינוני',
                  'low': 'נמוך',
                  'minimal': 'זניח'
                };

                return (
                  <div key={priority} className="flex items-center">
                    <div className="w-24 text-sm font-medium">{priorityNameMap[priority] || priority}</div>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(count / data.total) * 100}%` }}
                      />
                    </div>
                    <div className="w-10 text-right text-sm font-medium">{count}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <ReferralsTable 
        initialReferrals={data.all_referrals} 
        title="הפניות בהמתנה מעל 20 יום"
        showFilters={true}
      />
    </div>
  );
};

export default LongWaitingReferrals;