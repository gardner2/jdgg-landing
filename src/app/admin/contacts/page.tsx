'use client';

import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/admin/status-badge';
import { Search, Mail, Phone, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Contact {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  status: string;
  admin_notes: string;
  created_at: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    admin_notes: '',
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/admin/contacts');
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedContact) return;
    
    try {
      await fetch(`/api/admin/contacts/${selectedContact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      setShowDialog(false);
      setSelectedContact(null);
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const openContact = (contact: Contact) => {
    setSelectedContact(contact);
    setFormData({
      status: contact.status,
      admin_notes: contact.admin_notes || '',
    });
    setShowDialog(true);
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Contact Submissions</h1>
        <p className="text-muted-foreground">{contacts.length} total submissions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background min-w-[150px]"
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' ? 'No contacts found' : 'No contact submissions yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => openContact(contact)}
              className="modern-card border border-border rounded-xl p-6 cursor-pointer hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(contact.created_at).toLocaleString()}
                  </p>
                </div>
                <StatusBadge status={contact.status} />
              </div>

              <div className="grid sm:grid-cols-2 gap-2 mb-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {contact.email}
                </div>
                {contact.company && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    {contact.company}
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {contact.phone}
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2">
                {contact.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Contact Detail Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>

          {selectedContact && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold">{selectedContact.name}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{selectedContact.email}</p>
                  </div>
                  {selectedContact.phone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p>{selectedContact.phone}</p>
                    </div>
                  )}
                </div>

                {selectedContact.company && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Company</p>
                    <p>{selectedContact.company}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Message</p>
                  <p className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
                    {selectedContact.message}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Received</p>
                  <p>{new Date(selectedContact.created_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="border-t border-border pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Admin Notes</label>
                  <textarea
                    value={formData.admin_notes}
                    onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                    rows={3}
                    placeholder="Add internal notes..."
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpdate} className="flex-1">
                    Update
                  </Button>
                  <a href={`mailto:${selectedContact.email}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
