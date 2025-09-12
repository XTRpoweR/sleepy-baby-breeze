import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Shield, Monitor, MapPin, Clock, AlertTriangle, LogOut, RefreshCw, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AccountSecurity = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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

  const getEventDisplayInfo = (event: any) => {
    // Handle session invalidation events with better UX
    if (event.event_description.includes('Invalidated') && event.metadata?.invalidated_count !== undefined) {
      const count = event.metadata.invalidated_count;
      if (count === 0) {
        return {
          description: "Attempted to sign out all other devices (no other active sessions found)",
          severity: 'info',
          isRoutine: true
        };
      } else {
        return {
          description: `Successfully signed out ${count} other device${count === 1 ? '' : 's'}`,
          severity: count > 3 ? 'warning' : 'info',
          isRoutine: false
        };
      }
    }

    // Handle other event types with improved descriptions
    if (event.event_type === 'session_started') {
      return {
        description: "New sign-in detected",
        severity: event.severity,
        isRoutine: true
      };
    }

    if (event.event_type === 'password_changed') {
      return {
        description: "Password was successfully changed",
        severity: 'info',
        isRoutine: false
      };
    }

    // Default case
    return {
      description: event.event_description,
      severity: event.severity,
      isRoutine: event.severity === 'info'
    };
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
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Account Security</h1>
              <p className="text-muted-foreground">
                Monitor your account activity and manage active sessions
              </p>
            </div>
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

        {/* Security Overview Alert */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>About Security Events:</strong> We log various account activities for your security. 
            "Routine" events like sign-ins and session management are normal. Only pay attention to 
            unexpected activities or "high" severity events. Events showing "0" indicate actions 
            where nothing needed to be done (like signing out when no other sessions exist).
          </AlertDescription>
        </Alert>

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
              Track important security activities on your account. Routine events like sign-ins and session management are displayed for transparency.
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
                {securityEvents.slice(0, 10).map((event) => {
                  const eventInfo = getEventDisplayInfo(event);
                  return (
                    <div 
                      key={event.id} 
                      className={`border rounded-lg p-4 ${eventInfo.isRoutine ? 'bg-muted/20' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            {getEventIcon(event.event_type)}
                            <span className="font-medium">
                              {eventInfo.description}
                            </span>
                            <Badge variant={getSeverityColor(eventInfo.severity)}>
                              {eventInfo.severity}
                            </Badge>
                            {eventInfo.isRoutine && (
                              <Badge variant="outline" className="text-xs">
                                routine
                              </Badge>
                            )}
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
                                    View technical details
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
                  );
                })}
                
                {securityEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No Security Events</p>
                    <p>Your account security activity will appear here</p>
                  </div>
                )}

                {securityEvents.length > 10 && (
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing the 10 most recent events. Older events are automatically archived.
                    </p>
                  </div>
                )}
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