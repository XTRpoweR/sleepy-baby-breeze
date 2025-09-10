import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Shield, Monitor, MapPin, Clock, AlertTriangle, LogOut, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AccountSecurity = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    sessions,
    securityEvents,
    loading,
    currentSessionId,
    fetchSessions,
    fetchSecurityEvents,
    invalidateSession,
    invalidateAllOtherSessions
  } = useSessionManager();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSessions();
      fetchSecurityEvents();
    }
  }, [user, fetchSessions, fetchSecurityEvents]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSessions(), fetchSecurityEvents()]);
    setRefreshing(false);
  };

  const handleInvalidateSession = async (sessionId: string) => {
    const success = await invalidateSession(sessionId);
    if (success) {
      toast({
        title: "Session terminated",
        description: "The selected session has been logged out."
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to terminate session.",
        variant: "destructive"
      });
    }
  };

  const handleSignOutAllOtherDevices = async () => {
    const count = await invalidateAllOtherSessions();
    if (count > 0) {
      toast({
        title: "Sessions terminated",
        description: `Successfully logged out ${count} other sessions.`
      });
    } else {
      toast({
        title: "No other sessions",
        description: "No other active sessions were found."
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'secondary';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'session_started': return <Monitor className="h-4 w-4" />;
      case 'password_changed': return <Shield className="h-4 w-4" />;
      case 'session_invalidation': return <LogOut className="h-4 w-4" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please log in to view your account security settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Account Security</h1>
            <p className="text-muted-foreground">
              Monitor your account activity and manage active sessions
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Active Sessions
                </CardTitle>
                <CardDescription>
                  Manage devices that are currently signed in to your account
                </CardDescription>
              </div>
              {sessions.length > 1 && (
                <Button 
                  onClick={handleSignOutAllOtherDevices}
                  variant="outline"
                  size="sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out all other devices
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-muted-foreground">No active sessions found.</p>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => {
                  const isCurrentSession = session.session_id === currentSessionId;
                  return (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            <span className="font-medium">
                              {session.device_info || 'Unknown Device'}
                            </span>
                            {isCurrentSession && (
                              <Badge variant="secondary">Current Session</Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {session.ip_address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                IP: {session.ip_address}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              Last active: {formatDistanceToNow(new Date(session.last_activity_at), { addSuffix: true })}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              Signed in: {formatDistanceToNow(new Date(session.login_at), { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                        
                        {!isCurrentSession && (
                          <Button
                            onClick={() => handleInvalidateSession(session.session_id)}
                            variant="outline"
                            size="sm"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign out
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Recent Security Events
            </CardTitle>
            <CardDescription>
              Track important security activities on your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : securityEvents.length === 0 ? (
              <p className="text-muted-foreground">No security events recorded.</p>
            ) : (
              <div className="space-y-4">
                {securityEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.event_type)}
                          <span className="font-medium">
                            {event.event_description}
                          </span>
                          <Badge variant={getSeverityColor(event.severity)}>
                            {event.severity}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                          </div>
                          {event.ip_address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              IP: {event.ip_address}
                            </div>
                          )}
                          {event.metadata && Object.keys(event.metadata).length > 0 && (
                            <div className="mt-2">
                              <details className="text-xs">
                                <summary className="cursor-pointer hover:text-primary">
                                  View details
                                </summary>
                                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                  {JSON.stringify(event.metadata, null, 2)}
                                </pre>
                              </details>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Regularly review and remove unused active sessions</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Use strong, unique passwords and change them periodically</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Monitor security events for any suspicious activity</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p>Sign out of all devices when changing your password</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountSecurity;