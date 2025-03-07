import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Users, Loader, AlertTriangle, Bookmark, Clock } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import ReferralsTable from '../shared/ReferralsTable';

const ReferralsByTeam = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTeam, setActiveTeam] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/referrals/by-team/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setData(response.data);
        
        // קבע את הצוות הראשון כברירת מחדל
        if (response.data) {
          const firstTeam = Object.keys(response.data)[0];
          setActiveTeam(firstTeam);
        }
      } catch (err) {
        console.error('Error fetching referrals by team:', err);
        setError('אירעה שגיאה בטעינת נתוני ההפניות לפי צוות');
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

  // רשימת הצוותים
  const teams = Object.keys(data);

  // מיפוי צבעים לפי צוות
  const teamColors = {
    'אתק': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'רתק': 'bg-purple-50 text-purple-700 border-purple-200',
    'חוד': 'bg-sky-50 text-sky-700 border-sky-200',
    'מפלג': 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-right">הפניות לפי צוות</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teams.map(team => {
          const teamData = data[team];
          return (
            <Card 
              key={team} 
              className={`hover:shadow-md transition-shadow cursor-pointer border ${teamColors[team] || 'bg-gray-50 text-gray-700 border-gray-200'}`}
              onClick={() => setActiveTeam(team)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">צוות {team}</p>
                    <p className="text-2xl font-bold mt-1">{teamData.total}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 ml-1" />
                        {teamData.urgent} דחופים
                      </span>
                      <span className="text-xs inline-flex items-center px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                        <Clock className="h-3 w-3 ml-1" />
                        {teamData.needs_coordination} לתיאום
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-white shadow-sm">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeTeam && (
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">כל ההפניות</TabsTrigger>
            <TabsTrigger value="urgent">דחופים</TabsTrigger>
            <TabsTrigger value="coordination">דורשים תיאום</TabsTrigger>
            <TabsTrigger value="scheduled">נקבע תור</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <ReferralsTable 
              initialReferrals={data[activeTeam].referrals} 
              title={`כל ההפניות - צוות ${activeTeam}`}
              showFilters={true}
            />
          </TabsContent>
          
          <TabsContent value="urgent">
            <ReferralsTable 
              initialReferrals={data[activeTeam].referrals.filter(ref => 
                ['highest', 'urgent', 'high'].includes(ref.priority)
              )} 
              title={`הפניות דחופות - צוות ${activeTeam}`}
              showFilters={true}
            />
          </TabsContent>
          
          <TabsContent value="coordination">
            <ReferralsTable 
              initialReferrals={data[activeTeam].referrals.filter(ref => 
                ['requires_coordination', 'requires_soldier_coordination'].includes(ref.status)
              )} 
              title={`הפניות הדורשות תיאום - צוות ${activeTeam}`}
              showFilters={true}
            />
          </TabsContent>
          
          <TabsContent value="scheduled">
            <ReferralsTable 
              initialReferrals={data[activeTeam].referrals.filter(ref => 
                ref.status === 'appointment_scheduled'
              )} 
              title={`הפניות שנקבע להן תור - צוות ${activeTeam}`}
              showFilters={true}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ReferralsByTeam;