import { useState, useEffect } from "react";
import { useAuthSource } from "@/hooks/useAuthSource";
import { useDataSourceProfile } from "@/hooks/useDataSourceProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackNavigation } from "@/components/navigation/BackNavigation";
import { User, Link, FileText, Loader2, Github, Twitter, Linkedin, Globe } from "lucide-react";

export default function ProfileSettings() {
  const { profile, isLoading, updateProfile: updateDataProfile } = useDataSourceProfile();
  const { user, updateProfile: updateAuthProfile } = useAuthSource();

  const [displayName, setDisplayName] = useState("");
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Always reset fields when profile changes (including when null)
    setDisplayName(profile?.display_name || user?.name || "");
    setNickname(profile?.nickname || "");
    setBio(profile?.bio || "");
    setGithubUrl(profile?.github_url || "");
    setTwitterUrl(profile?.twitter_url || "");
    setLinkedinUrl(profile?.linkedin_url || "");
    setWebsiteUrl(profile?.website_url || "");
  }, [profile, user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // 1. Update data layer profile
      await updateDataProfile({
        display_name: displayName || null,
        nickname: nickname || null,
        bio: bio || null,
      });

      // 2. Sync with auth layer oneapp_users
      await updateAuthProfile({
        display_name: displayName || null,
        nickname: nickname || null,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSocial = async () => {
    setIsSaving(true);
    try {
      await updateDataProfile({
        github_url: githubUrl || null,
        twitter_url: twitterUrl || null,
        linkedin_url: linkedinUrl || null,
        website_url: websiteUrl || null,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackNavigation to="/profile" label="Profile" />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your profile information
        </p>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </div>
          <CardDescription>
            Your public profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Name</Label>
              <Input
                id="display-name"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">@</span>
                <Input
                  id="nickname"
                  placeholder="Enter your nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Bio</CardTitle>
          </div>
          <CardDescription>
            Tell others a little about yourself
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Write a short bio..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Bio
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Social Links</CardTitle>
          </div>
          <CardDescription>
            Connect your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="github" className="flex items-center gap-2">
                <Github className="w-4 h-4" /> GitHub
              </Label>
              <Input
                id="github"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter" className="flex items-center gap-2">
                <Twitter className="w-4 h-4" /> Twitter
              </Label>
              <Input
                id="twitter"
                placeholder="https://twitter.com/username"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="w-4 h-4" /> Website
              </Label>
              <Input
                id="website"
                placeholder="https://yourwebsite.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleSaveSocial} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Social Links
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
